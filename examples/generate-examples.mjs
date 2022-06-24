import * as fs from 'fs'

const examples = fs
  .readdirSync('./examples')
  .filter((name) => /tsx$/.exec(name))
  .filter((name) => name !== 'server.tsx')

const code = `import React, { useEffect } from 'react'
import * as ReactDOM from 'react-dom'
import ReactDOMClient from 'react-dom/client'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

export default function App() {
  const [exampleComponents, setExampleComponents] = React.useState([])
  useEffect(() => {
    void Promise.all([
        ${examples
          .map((path) => {
            const p = path.replace('.tsx', '')
            return `Promise.all([ import("./${p}") , "/${p}" ])\n`
          })
          .join(', ')}
      ]).then((components) => {
        setExampleComponents(() => {
          return components.map(([comp, name]) => {
            return { name, component: comp.default }
          })
        })
    })
  }, [])

  return (
    
    <React.StrictMode>
      <Router>
        <div style={{ height: '100%', display: 'flex' }}>

          <div style={{ flex: 1, height: '100%'  }} id="test-root" >
          <Switch>
            {exampleComponents.map(({ name, component }, index) => (
              <Route key={index} path={name} component={component} />
            ))}
          </Switch>
        </div>

        <ul style={{ minWidth: 200 }} id="side-nav">
          { exampleComponents.map(({ name }, index) => <li key={index}><Link to={name}>{name}</Link></li>) }
        </ul>

      </div>
      </Router>
    </React.StrictMode>
  )
}

if (location.search.includes('r18') || navigator.acceptLanguage == 'de-DE') {
  ReactDOMClient.createRoot(document.getElementById('root')).render(<App />)
  document.body.style.backgroundColor = 'beige'
} else {
  ReactDOM.render(<App />, document.getElementById('root')) //.render(<App />)
}
`

const htmlCode = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>RV Test Cases</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
      html, body {
        padding: 0;
        margin: 0;
      }

      #root {
        min-height: 500px;
      }

      @media screen and (max-width: 900px) {
        #side-nav {
          display: none;
        }
      }
    </style>
    <style type="text/css" id="toggle-gap">
      [data-test-id="virtuoso-item-list"] {
        display: flex;
        gap: 20px;
        flex-direction: column;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="./__examples.jsx"></script>
    <div>
      <label><input type="checkbox" onchange="document.getElementById('toggle-gap').media = this.checked ? 'all' : 'max-width: 1px' ">Toggle gap</label>
  </div>
  </body>
</html>
`

fs.writeFileSync('examples/__examples.jsx', code)
fs.writeFileSync('examples/__examples.html', htmlCode)
