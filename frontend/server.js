// Azure App Service는 포트 8080을 기본으로 사용
// 이 파일은 Next.js 애플리케이션을 포트 8080에서 실행합니다

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Azure App Service에서 사용할 포트 (기본값: 8080)
const PORT = process.env.PORT || 8080

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(PORT, '0.0.0.0', () => {
    console.log(`> Server listening at http://0.0.0.0:${PORT} as ${dev ? 'development' : 'production'}`)
    console.log(`> URL: http://localhost:${PORT}`)
  })
})
