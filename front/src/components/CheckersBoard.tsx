'use client'

import { useEffect, useState } from 'react'
import * as Ably from 'ably'

type PieceType = 'normal' | 'king'
type PieceColor = 'red' | 'black'

interface Piece {
  color: PieceColor
  type: PieceType
}

interface BoardState {
  [key: string]: Piece | null
}

interface CheckersBoardProps {
  roomId: string
  playerId: string
  playerColor: PieceColor | null
  currentTurn: PieceColor
  onMove: (from: { row: number; col: number }, to: { row: number; col: number }) => void
  channel: Ably.Types.RealtimeChannelCallbacks | null
}

const CheckersBoard: React.FC<CheckersBoardProps> = ({
  roomId,
  playerId,
  playerColor,
  currentTurn,
  onMove,
  channel,
}) => {
  const [board, setBoard] = useState<BoardState>({})
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null)
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([])

  // Inicializar tabuleiro
  useEffect(() => {
    const initialBoard: BoardState = {}

    // Peças pretas (3 primeiras linhas)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          initialBoard[`${row}-${col}`] = { color: 'black', type: 'normal' }
        }
      }
    }

    // Peças vermelhas (3 últimas linhas)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          initialBoard[`${row}-${col}`] = { color: 'red', type: 'normal' }
        }
      }
    }

    setBoard(initialBoard)
  }, [])

  // Escutar atualizações do jogo via Ably
  useEffect(() => {
    if (!channel) return

    channel.subscribe('game-move', (message) => {
      const { board: newBoard } = message.data
      setBoard(newBoard)
      setSelectedPiece(null)
      setValidMoves([])
    })
  }, [channel])

  const getPiece = (row: number, col: number): Piece | null => {
    return board[`${row}-${col}`] || null
  }

  const calculateValidMoves = (row: number, col: number): { row: number; col: number }[] => {
    const piece = getPiece(row, col)
    if (!piece) return []

    const moves: { row: number; col: number }[] = []
    const directions = piece.type === 'king'
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] // Rei move em todas as diagonais
      : piece.color === 'red'
        ? [[-1, -1], [-1, 1]] // Vermelho move para cima
        : [[1, -1], [1, 1]] // Preto move para baixo

    // Movimento simples
    for (const [dr, dc] of directions) {
      const newRow = row + dr
      const newCol = col + dc

      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!getPiece(newRow, newCol)) {
          moves.push({ row: newRow, col: newCol })
        }
      }
    }

    // Captura (pular peça inimiga)
    for (const [dr, dc] of directions) {
      const jumpRow = row + dr * 2
      const jumpCol = col + dc * 2
      const midRow = row + dr
      const midCol = col + dc

      if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
        const midPiece = getPiece(midRow, midCol)
        const jumpPiece = getPiece(jumpRow, jumpCol)

        if (midPiece && midPiece.color !== piece.color && !jumpPiece) {
          moves.push({ row: jumpRow, col: jumpCol })
        }
      }
    }

    return moves
  }

  const handleSquareClick = (row: number, col: number) => {
    // Só permitir jogadas no turno do jogador
    if (currentTurn !== playerColor) return

    const piece = getPiece(row, col)

    // Se clicou em uma peça própria
    if (piece && piece.color === playerColor) {
      setSelectedPiece({ row, col })
      setValidMoves(calculateValidMoves(row, col))
      return
    }

    // Se tem uma peça selecionada e clicou em um movimento válido
    if (selectedPiece) {
      const isValidMove = validMoves.some(
        (move) => move.row === row && move.col === col
      )

      if (isValidMove) {
        // Executar movimento
        const newBoard = { ...board }
        const piece = getPiece(selectedPiece.row, selectedPiece.col)!

        // Remover peça da posição antiga
        delete newBoard[`${selectedPiece.row}-${selectedPiece.col}`]

        // Verificar se é uma captura
        const rowDiff = Math.abs(row - selectedPiece.row)
        if (rowDiff === 2) {
          // Remover peça capturada
          const midRow = (selectedPiece.row + row) / 2
          const midCol = (selectedPiece.col + col) / 2
          delete newBoard[`${midRow}-${midCol}`]
        }

        // Verificar promoção a rei
        let newPiece = { ...piece }
        if ((piece.color === 'red' && row === 0) || (piece.color === 'black' && row === 7)) {
          newPiece.type = 'king'
        }

        // Adicionar peça na nova posição
        newBoard[`${row}-${col}`] = newPiece

        setBoard(newBoard)
        onMove(selectedPiece, { row, col })
        setSelectedPiece(null)
        setValidMoves([])
      } else {
        // Clicou fora dos movimentos válidos, desselecionar
        setSelectedPiece(null)
        setValidMoves([])
      }
    }
  }

  const isValidMoveSquare = (row: number, col: number): boolean => {
    return validMoves.some((move) => move.row === row && move.col === col)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <div className="text-white text-xl font-bold mb-2">
          {currentTurn === playerColor ? (
            <span className="text-green-400">✨ Seu turno!</span>
          ) : (
            <span className="text-gray-400">Aguarde sua vez...</span>
          )}
        </div>
      </div>

      <div className="inline-block bg-amber-900 p-4 rounded-xl shadow-2xl">
        <div className="grid grid-cols-8 gap-0 border-4 border-amber-950">
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => {
              const piece = getPiece(row, col)
              const isLight = (row + col) % 2 === 0
              const isSelected = selectedPiece?.row === row && selectedPiece?.col === col
              const isValidMove = isValidMoveSquare(row, col)

              return (
                <div
                  key={`${row}-${col}`}
                  onClick={() => handleSquareClick(row, col)}
                  className={`
                    w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer
                    transition-all duration-200
                    ${isLight ? 'bg-amber-200' : 'bg-amber-800'}
                    ${isSelected ? 'ring-4 ring-yellow-400 ring-inset' : ''}
                    ${isValidMove ? 'ring-4 ring-green-400 ring-inset' : ''}
                    ${currentTurn === playerColor && piece?.color === playerColor ? 'hover:opacity-80' : ''}
                  `}
                >
                  {piece && (
                    <div
                      className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center
                        shadow-lg transform transition-transform hover:scale-110
                        ${piece.color === 'red'
                          ? 'bg-gradient-to-br from-red-500 to-red-700 border-2 border-red-900'
                          : 'bg-gradient-to-br from-gray-800 to-black border-2 border-gray-900'
                        }
                      `}
                    >
                      {piece.type === 'king' && (
                        <span className="text-2xl">👑</span>
                      )}
                    </div>
                  )}
                  {isValidMove && !piece && (
                    <div className="w-4 h-4 bg-green-400 rounded-full opacity-75"></div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="mt-4 text-gray-300 text-sm text-center">
        <p>Você está jogando como {playerColor === 'red' ? '🔴 Vermelho' : '⚫ Preto'}</p>
      </div>
    </div>
  )
}

export default CheckersBoard
