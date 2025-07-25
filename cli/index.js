#!/usr/bin/env node

import prompts from 'prompts'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { parseStringPromise } from 'xml2js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// For __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Helper to extract domain from URL
function getDomain(url) {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return url
  }
}

// Discover pages via sitemap or crawling
async function discoverPages(baseUrl) {
  const pages = new Set()
  
  // Try sitemap.xml first
  try {
    console.log('🔍 Checking for sitemap.xml...')
    const sitemapUrl = new URL('/sitemap.xml', baseUrl).href
    const { data: sitemapXml } = await axios.get(sitemapUrl, { timeout: 5000 })
    const sitemap = await parseStringPromise(sitemapXml)
    
    // Extract URLs from sitemap
    if (sitemap.urlset && sitemap.urlset.url) {
      sitemap.urlset.url.forEach(entry => {
        if (entry.loc && entry.loc[0]) {
          pages.add(entry.loc[0])
        }
      })
      console.log(`✅ Found ${pages.size} pages in sitemap`)
      return Array.from(pages)
    }
  } catch (err) {
    console.log('📄 No sitemap found, falling back to crawler...')
  }
  
  // Fallback: Simple crawler
  const visited = new Set()
  const queue = [baseUrl]
  const domain = getDomain(baseUrl)
  const maxPages = 20
  const maxDepth = 2
  
  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift()
    if (visited.has(url)) continue
    
    try {
      const { data: html } = await axios.get(url, { timeout: 5000 })
      visited.add(url)
      pages.add(url)
      
      // Extract links
      const $ = cheerio.load(html)
      $('a[href]').each((_, elem) => {
        const href = $(elem).attr('href')
        if (!href) return
        
        const fullUrl = new URL(href, url).href
        const linkDomain = getDomain(fullUrl)
        
        // Only follow same-domain links
        if (linkDomain === domain && !visited.has(fullUrl)) {
          // Skip login, admin, etc
          if (!/\/(login|admin|auth|api|\.)/i.test(fullUrl)) {
            queue.push(fullUrl)
          }
        }
      })
    } catch (err) {
      // Skip inaccessible pages
    }
  }
  
  console.log(`🔗 Crawled ${pages.size} pages`)
  return Array.from(pages)
}

// Split text into semantic chunks
function chunkText(text, maxTokens = 400) {
  const chunks = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  
  let currentChunk = ''
  let currentTokens = 0
  
  for (const sentence of sentences) {
    const sentenceTokens = Math.ceil(sentence.length / 4) // Rough token estimate
    
    if (currentTokens + sentenceTokens > maxTokens && currentChunk) {
      chunks.push({
        text: currentChunk.trim(),
        tokens: currentTokens
      })
      currentChunk = sentence
      currentTokens = sentenceTokens
    } else {
      currentChunk += ' ' + sentence
      currentTokens += sentenceTokens
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      tokens: currentTokens
    })
  }
  
  return chunks
}

// Main CLI function
async function main() {
  // Get base URL
  const { url } = await prompts({
    type: 'text',
    name: 'url',
    message: 'Enter the website URL to vectorize:'
  })
  
  const baseUrl = url.startsWith('http') ? url : `https://${url}`
  
  // Check if Ollama is running
  try {
    await axios.get('http://localhost:11434/api/tags')
  } catch (err) {
    console.error('❌ Ollama is not running. Run `ollama serve` in another terminal.')
    process.exit(1)
  }
  
  // Discover pages
  console.log(`\n🌐 Discovering pages on ${getDomain(baseUrl)}...`)
  const pages = await discoverPages(baseUrl)
  
  if (pages.length === 0) {
    console.log('❌ No pages found')
    return
  }
  
  // Prompt for page selection
  const { choice } = await prompts({
    type: 'select',
    name: 'choice',
    message: `🔍 Found ${pages.length} pages.\n\nDo you want to:`,
    choices: [
      { title: '1️⃣  Embed ALL pages', value: 'all' },
      { title: '2️⃣  Choose how many pages to embed', value: 'custom' },
      { title: '3️⃣  ONLY embed homepage', value: 'homepage' }
    ]
  })
  
  let selectedPages = []
  
  switch (choice) {
    case 'all':
      selectedPages = pages
      break
    case 'custom':
      const { count } = await prompts({
        type: 'number',
        name: 'count',
        message: 'How many pages to embed?',
        initial: Math.min(10, pages.length),
        min: 1,
        max: pages.length
      })
      selectedPages = pages.slice(0, count)
      break
    case 'homepage':
      selectedPages = [baseUrl]
      break
  }
  
  console.log(`\n📊 Processing ${selectedPages.length} pages...`)
  
  // Process each page
  const allChunks = []
  
  for (let i = 0; i < selectedPages.length; i++) {
    const pageUrl = selectedPages[i]
    console.log(`\n[${i + 1}/${selectedPages.length}] Processing: ${pageUrl}`)
    
    try {
      // Fetch page
      const { data: html } = await axios.get(pageUrl)
      
      // Extract text
      const $ = cheerio.load(html)
      $('script, style, noscript').remove()
      const text = $('body').text().replace(/\s+/g, ' ').trim()
      
      // Create chunks
      const chunks = chunkText(text)
      console.log(`   ✂️  Split into ${chunks.length} chunks`)
      
      // Embed each chunk
      for (let j = 0; j < chunks.length; j++) {
        const chunk = chunks[j]
        console.log(`   🧠 Embedding chunk ${j + 1}/${chunks.length}...`)
        
        const res = await axios.post('http://localhost:11434/api/embeddings', {
          model: 'nomic-embed-text',
          prompt: chunk.text
        })
        
        const urlSlug = pageUrl.replace(baseUrl, '').replace(/[^a-z0-9]/gi, '-') || 'home'
        
        allChunks.push({
          id: `${urlSlug}-${j + 1}`,
          url: pageUrl,
          text: chunk.text,
          embedding: res.data.embedding,
          tokens: chunk.tokens
        })
      }
    } catch (err) {
      console.error(`   ❌ Failed to process ${pageUrl}:`, err.message)
    }
  }
  
  // Generate vectors.json
  const vectors = {
    source: baseUrl,
    lastUpdated: new Date().toISOString(),
    model: 'nomic-embed-text',
    totalChunks: allChunks.length,
    chunks: allChunks
  }
  
  // Get domain name for export directory
  const websiteName = getDomain(baseUrl)
  
  // Check if output is too large (>10MB)
  const jsonSize = JSON.stringify(vectors).length
  
  if (jsonSize > 10 * 1024 * 1024) {
    console.log('\n📦 Output too large, splitting by page...')
    
    // Create index file
    const index = {
      source: baseUrl,
      lastUpdated: new Date().toISOString(),
      model: 'nomic-embed-text',
      files: []
    }
    
    // Group chunks by URL
    const chunksByUrl = {}
    allChunks.forEach(chunk => {
      if (!chunksByUrl[chunk.url]) {
        chunksByUrl[chunk.url] = []
      }
      chunksByUrl[chunk.url].push(chunk)
    })
    
    // Save each page separately
    const vectorsDir = path.join(__dirname, '..', 'exports', websiteName, '.well-known', 'vectors')
    fs.mkdirSync(vectorsDir, { recursive: true })
    
    Object.entries(chunksByUrl).forEach(([url, chunks]) => {
      const slug = url.replace(baseUrl, '').replace(/[^a-z0-9]/gi, '-') || 'home'
      const filename = `${slug}.json`
      
      fs.writeFileSync(
        path.join(vectorsDir, filename),
        JSON.stringify({ url, chunks }, null, 2)
      )
      
      index.files.push({
        url,
        file: `/vectors/${filename}`,
        chunks: chunks.length
      })
    })
    
    // Save index
    fs.writeFileSync(
      path.join(__dirname, '..', 'exports', websiteName, '.well-known', 'vectors.json'),
      JSON.stringify(index, null, 2)
    )
    
    console.log(`✅ Created vectors index at ./exports/${websiteName}/.well-known/vectors.json`)
  } else {
    // Save single file
    const outDir = path.join(__dirname, '..', 'exports', websiteName, '.well-known')
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(
      path.join(outDir, 'vectors.json'),
      JSON.stringify(vectors, null, 2)
    )
    
    console.log(`✅ Created vectors.json at ./exports/${websiteName}/.well-known/vectors.json`)
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   • Pages processed: ${selectedPages.length}`)
  console.log(`   • Total chunks: ${allChunks.length}`)
  console.log(`   • Output size: ${(jsonSize / 1024 / 1024).toFixed(2)} MB`)
}

// Run the CLI
main().catch(console.error)