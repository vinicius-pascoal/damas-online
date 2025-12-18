# 🎲 Regras do Jogo de Damas

## Objetivo
Capturar todas as peças do adversário ou bloquear todos os seus movimentos possíveis.

## Configuração Inicial

### Tabuleiro
- Tabuleiro 8x8 (64 casas)
- Apenas as casas escuras são usadas
- 12 peças vermelhas (parte inferior)
- 12 peças pretas (parte superior)

### Posicionamento
- Peças pretas ocupam as 3 primeiras linhas (linhas 0, 1, 2)
- Peças vermelhas ocupam as 3 últimas linhas (linhas 5, 6, 7)
- Apenas nas casas escuras (onde linha + coluna é ímpar)

## Movimentos

### Peças Normais
- Movem-se **apenas para frente** na diagonal
- Uma casa por vez
- **Vermelhas**: sobem (direção linha 0)
- **Pretas**: descem (direção linha 7)

### Damas (Reis) 👑
- Movem-se em **todas as direções** diagonais (frente e trás)
- Uma casa por vez
- São promovidas quando uma peça normal alcança a última linha do lado oposto:
  - Vermelha alcança linha 0 → vira Dama
  - Preta alcança linha 7 → vira Dama

## Capturas

### Regras de Captura
- Capturas são obrigatórias quando disponíveis
- Para capturar, **pule sobre a peça adversária** para a casa vazia imediatamente após ela
- A peça capturada é removida do tabuleiro
- Capturas podem ser encadeadas (múltiplas capturas em um turno) - *não implementado ainda*

### Como Capturar
1. Peça própria adjacente à peça adversária
2. Casa vazia após a peça adversária (na diagonal)
3. Pule sobre o adversário para a casa vazia

Exemplo:
```
[Sua Peça] → [Peça Adversária] → [Casa Vazia]
```

### Capturas com Damas
- Damas capturam da mesma forma que peças normais
- Mas podem capturar em todas as direções diagonais

## Turnos

### Ordem de Jogo
1. **Vermelhas** sempre começam
2. Jogadores alternam turnos
3. Um movimento por turno
4. O turno atual é exibido na interface

### Seu Turno
- Indicado por "✨ Seu turno!" (verde)
- Clique na sua peça para ver movimentos válidos
- Movimentos válidos aparecem com anel verde
- Clique no destino para mover

### Turno do Oponente
- Indicado por "Aguarde sua vez..." (cinza)
- Você não pode mover peças
- Aguarde o oponente fazer seu movimento

## Vitória

### Condições de Vitória
Um jogador vence quando:
1. **Captura todas as peças do adversário**
2. **Bloqueia todos os movimentos do adversário** (stalemate) - *não implementado*

### Fim de Jogo
- Status da sala muda para "🏁 Finalizado"
- O vencedor é anunciado

## Interface

### Indicadores Visuais

#### Peças
- 🔴 **Vermelho**: Peças vermelhas
- ⚫ **Preto**: Peças pretas
- 👑 **Coroa**: Indica Dama (Rei)

#### Seleção e Movimentos
- **Anel Amarelo**: Peça selecionada
- **Anel Verde**: Movimento válido disponível
- **Ponto Verde**: Posição vazia onde você pode mover

#### Status da Sala
- ⏳ **Aguardando**: Esperando segundo jogador
- 🎮 **Jogando**: Partida em andamento
- 🏁 **Finalizado**: Jogo terminou

### Cores das Peças
- **Vermelhas**: Gradiente vermelho com borda escura
- **Pretas**: Gradiente cinza escuro/preto com borda

## Dicas Estratégicas

### Iniciantes
1. **Controle o centro** do tabuleiro
2. **Proteja suas peças** - evite deixá-las isoladas
3. **Procure capturas** - são obrigatórias e vantajosas
4. **Promova suas peças** a Damas quando possível

### Avançado
1. **Crie Damas cedo** - elas são muito poderosas
2. **Force trocas favoráveis** quando estiver em vantagem
3. **Bloqueie peças adversárias** na borda
4. **Mantenha peças na última linha** para evitar avanço inimigo

## Diferenças com Damas Clássicas

### Implementado ✅
- Movimentos básicos (frente/diagonais)
- Capturas simples
- Promoção a Dama
- Damas movem em todas direções
- Sistema de turnos
- Detecção de vitória por captura total

### Não Implementado ⚠️
- Capturas múltiplas obrigatórias (sequência)
- Regra da maioria (captura obrigatória com mais peças)
- Sopro (penalidade por não capturar)
- Empate por repetição
- Empate por falta de progressão
- Damas voarem (movimentos longos)

## Regras Específicas desta Implementação

1. **Capturas**: Uma captura por turno
2. **Damas**: Movem apenas uma casa (não voam)
3. **Vitória**: Apenas por captura total de peças
4. **Início**: Vermelhas sempre começam
5. **Salas**: Máximo 2 jogadores por sala

## Como Começar a Jogar

1. **Crie ou entre em uma sala**
2. **Aguarde o segundo jogador**
3. **Vermelhas começam** - veja o indicador de turno
4. **Clique em sua peça** para selecionar
5. **Clique no destino** (anel verde) para mover
6. **Capture peças** pulando sobre elas
7. **Promova a Dama** chegando na última linha
8. **Vença** capturando todas as peças adversárias

## Suporte

Problemas ou dúvidas sobre as regras?
- Abra uma issue no GitHub
- Consulte a documentação do projeto

---

**Bom jogo! 🎮**
