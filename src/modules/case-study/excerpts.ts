// One excerpt per case study, verbatim, pinned to the commit it was read at.
// `lines` marks an excerpt from a longer file; without it the file is whole.
export const excerpts = {
  'starwars-api': {
    lang: 'yaml',
    repository: 'bgalvandev/starwars-api',
    commit: 'a1c3618cb84871217909e893f48f181f94e98a56',
    path: 'serverless.yml',
    lines: [14, 23],
    code: '  iamRoleStatements:\n    - Effect: Allow\n      Action:\n        - dynamodb:Scan\n        - dynamodb:GetItem\n        - dynamodb:PutItem\n        - dynamodb:UpdateItem\n        - dynamodb:DeleteItem\n      Resource:\n        - arn:aws:dynamodb:${self:provider.region}:${aws:accountId}:table/${env:DYNAMODB_TABLE}',
  },
  'idbi-invoice': {
    lang: 'php',
    repository: 'bgalvandev/idbi-invoice-challenge',
    commit: 'dd57189fcb35ad1d567664208ec2f9235001262e',
    path: 'routes/api.php',
    code: "<?php\n\nuse Illuminate\\Support\\Facades\\Route;\n\ninclude_once 'v1/no-auth.php';\n\nRoute::group(['middleware' => ['jwt.verify']], function () {\n    include_once 'v1/auth.php';\n});",
  },
  'rimac-frontend': {
    lang: 'tsx',
    repository: 'bgalvandev/rimac-frontend-challenge',
    commit: '2f79388f0b25caa36aef5307382f88ecc410bc9c',
    path: 'src/App.tsx',
    code: 'import React from "react";\nimport { BrowserRouter as Router, Route, Routes } from "react-router-dom";\nimport Home from "./pages/Home/Home";\nimport Plans from "./pages/Plans/Plans";\nimport Summary from "./pages/Summary/Summary";\n\nconst App: React.FC = () => {\n  return (\n    <Router>\n      <Routes>\n        <Route path="/" element={<Home />} />\n        <Route path="/plans" element={<Plans />} />\n        <Route path="/summary" element={<Summary />} />\n      </Routes>\n    </Router>\n  );\n};\n\nexport default App;',
  },
} as const;
