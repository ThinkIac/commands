# @thinkiac/module-commands

Implementação do módulo commands do Lógos em `.type`, compilada com LogosType.
Migração compatível da API existente, sem novos eventos ou permissões.

```sh
npm install ThinkIac/commands#main
npm test
npm run test:isolated
```

O pacote distribui `dist/index.cjs`, fontes e wrappers legados em `compat/`.
`provideCommands(host)` é o provedor declarativo; `createRuntimeModule` é seu alias de biblioteca.
`createHost` usa o SDK externo runtime-compat, fixado por commit.
O registro existente é preservado por `@register module` com contexto capability.

## Comportamento

`createCommandRunner(ports)` retorna `run(workspace, name, args, context)`.
Quando context.pkg existe, limita a descoberta à pasta correspondente e verifica
que ela é um diretório. Sem pkg, mantém a descoberta do workspace completo.
Valida condições, resolve middlewares e retorna o resultado do handler.

`provideCommands(host)` expõe api.run e escuta `command:run` com prioridade 50.
Payload: workspace opcional, name e args; o contexto é transmitido ao runner.
Erros de pacote ausente, comando ausente, condição negada e falhas de execução
são propagados. Não há cache próprio nem recursos persistentes para fechar.

A implementação usa node:fs e node:path; esta migração não promete portabilidade
para QuickJS ou ESP32. As portas de scanner e middleware continuam no host.

## Desenvolvimento e compatibilidade

`npm run build` compila src/*.type; `npm test` testa o artefato compilado.
A CI executa testes e instalação isolada. Os wrappers CommonJS legados são
preservados deliberadamente, não convertidos em uma segunda implementação.
O compilador é ferramenta de build; não é exigido para carregar o artefato.
