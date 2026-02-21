import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return new Response('Test route works! URL: ' + request.url, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })
}
