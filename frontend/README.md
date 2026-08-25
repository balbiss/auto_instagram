# InstaFlow Dashboard

Crie o dashboard de um SaaS de automação de Instagram (Instagram automation platform) — painel onde o usuário conecta a conta Instagram Business dele e gerencia respostas automáticas de comentários, DMs automatizadas e agendamento de posts/reels.

Identidade visual: use a paleta oficial de gradiente do Instagram como assinatura da marca — roxo #833AB4, magenta #C13584, rosa-vermelho #E1306C, laranja #F56040, amarelo #FCAF45, com azul #405DE6 como acento frio de contraste. Aplique o gradiente com moderação: logo, ícones de destaque, barra de progresso, botões primários e badges de status — não pinte fundos inteiros nem textos longos com ele. Base neutra em cinza-quase-preto/branco (modo claro e escuro), gradiente só como toque de cor sobre essa base neutra.

Telas principais:

Dashboard — cards de métricas (comentários respondidos hoje, DMs enviadas, posts agendados, contas conectadas), uso de cota (ex: "12/25 posts hoje")

Conectar conta — fluxo OAuth com a conta Instagram Business (botão "Conectar Instagram" no estilo da marca)

Automações — lista de regras (gatilho: comentário com palavra-chave → resposta pública + DM privada), criar/editar regra

Caixa de entrada (Inbox) — conversas de DM, estilo chat

Agendamento de posts — calendário/lista de posts agendados (feed, reels, stories), upload de mídia, prévia

Configurações — conta, billing, limites

Tipografia moderna e limpa (sans-serif), cantos arredondados, espaçamento generoso, mobile-responsivo. Priorize legibilidade e hierarquia clara sobre decoração.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/191e3e4e-6b43-4629-a55b-7edbb05a81dd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
