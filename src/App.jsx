import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Notify } from 'notiflix';

const LEVELS = {
  gampang: {label: 'Gampang', ops: ['+','-'], a:[1,20], b:[1,20], time:30, totalQuestions: 10},
  lumayan: {label: 'Lumayan', ops: ['*','/'], a:[1,12], b:[1,12], time:30, totalQuestions: 10},
  susah: {label: 'Susah', ops: ['+','-','*','/'], a:[1,100], b:[1,50], time:40, totalQuestions: 10},
}

Notify.init({
  timeout: 2000,
  clickToClose: true,
});

function randInt(min,max){ 
  return Math.floor(Math.random()*(max-min+1))+min 
}

function generateQuestion(levelKey){
  const cfg = LEVELS[levelKey]
  const op = cfg.ops[Math.floor(Math.random()*cfg.ops.length)]
  let a, b, answer
  
  switch(op) {
    case '+':
      a = randInt(...cfg.a)
      b = randInt(...cfg.b)
      answer = a + b
      break
    case '-':
      a = randInt(...cfg.a)
      b = randInt(...cfg.b)
      if(b > a) [a, b] = [b, a]
      answer = a - b
      break
    case '*':
      a = randInt(...cfg.a)
      b = randInt(...cfg.b)
      answer = a * b
      break
    case '/':
      b = randInt(...cfg.b)
      answer = randInt(1, Math.min(...cfg.a))
      a = b * answer
      break
    default:
      a = randInt(...cfg.a)
      b = randInt(...cfg.b)
      answer = a + b
  }
  
  const text = `${a} ${op} ${b}`
  const choices = [answer]
  const usedNumbers = new Set([answer])
  
  while(choices.length < 4){
    const delta = Math.max(1, Math.round(Math.abs(answer)*0.2))
    let cand
    let attempts = 0
    
    do {
      cand = answer + randInt(-delta, delta)
      attempts++
      if(attempts > 10) {
        cand = answer + randInt(-5, 5)
        break
      }
    } while(usedNumbers.has(cand))
    
    usedNumbers.add(cand)
    choices.push(cand)
  }
  
  for(let i = choices.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]]
  }
  
  return { text, answer, choices }
}

const showAlert = (message, type = 'info') => {
  switch(type) {
    case 'success':
      Notify.success(message, { timeout: 2000 });
      break;
    case 'failure':
      Notify.failure(message, { timeout: 2000 });
      break;
    case 'warning':
      Notify.warning(message, { timeout: 2000 });
      break;
    case 'info':
      Notify.info(message, { timeout: 2000 });
      break;
    default:
      Notify.info(message, { timeout: 2000 });
  }
};

export default function App(){
  const [level, setLevel] = useState('gampang')
  const [question, setQuestion] = useState(() => generateQuestion('gampang'))
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [qnum, setQnum] = useState(1)
  const [timeLeft, setTimeLeft] = useState(LEVELS[level].time)
  const [running, setRunning] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [playerName, setPlayerName] = useState('')

  const nameInputRef = useRef(null)
  const generateQuestionOptimized = useCallback((levelKey) => {
    return generateQuestion(levelKey)
  }, [])

  const resetAll = useCallback(() => {
    setQuestion(generateQuestionOptimized(level))
    setSelected(null)
    setScore(0)
    setQnum(1)
    setTimeLeft(LEVELS[level].time)
    setRunning(false)
    setGameStarted(false)
    setGameFinished(false)
  }, [level, generateQuestionOptimized])

  useEffect(() => {
    resetAll()
  }, [level, resetAll])

  useEffect(() => {
    if (nameInputRef.current && !gameStarted) {
      nameInputRef.current.focus()
    }
  }, [gameStarted])

  const finishGame = useCallback(() => {
    setRunning(false)
    setGameFinished(true)
    setGameStarted(false)
  }, [])

  const nextQuestion = useCallback(() => {
    if (qnum < LEVELS[level].totalQuestions) {
      setQuestion(generateQuestionOptimized(level))
      setSelected(null)
      setQnum(prev => prev + 1)
      setTimeLeft(LEVELS[level].time)
      setRunning(true)
    } else {
      finishGame()
    }
  }, [qnum, level, generateQuestionOptimized, finishGame])

  useEffect(() => {
    if(!running || !gameStarted) return
    
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if(prevTime <= 1) {
          if (qnum < LEVELS[level].totalQuestions) {
            showAlert('Waktu habis! Melanjutkan ke pertanyaan berikutnya.', 'warning');
            nextQuestion()
          } else {
            showAlert(`Selamat! Anda telah menyelesaikan semua pertanyaan.`, 'success');
            finishGame()
          }
          return LEVELS[level].time
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [running, gameStarted, level, qnum, nextQuestion, finishGame])

  const startGame = useCallback(() => {
    if (!playerName.trim()) {
      showAlert('Masukkan nama kamu dulu yaa', 'failure');
      if (nameInputRef.current) {
        nameInputRef.current.focus()
      }
      return
    }
    setGameStarted(true)
    setRunning(true)
    setTimeLeft(LEVELS[level].time)
    showAlert(`Game dimulai! Selamat bermain, ${playerName}! 🎮`, 'success');
  }, [level, playerName])

  const submit = useCallback(() => {
    if(selected === null || !gameStarted) {
      if (selected === null) {
        showAlert('Harap pilih jawaban terlebih dahulu!', 'warning');
      }
      return
    }
    
    const isCorrect = Number(selected) === question.answer
    if(isCorrect) {
      setScore(prevScore => prevScore + 1)
      showAlert('Jawaban benar! 🎉', 'success');
    } else {
      showAlert(`Jawaban salah! Yang benar: ${question.answer}`, 'failure');
    }
    
    if (qnum < LEVELS[level].totalQuestions) {
      setTimeout(() => {
        nextQuestion()
      }, 1000)
    } else {
      setTimeout(() => {
        showAlert(`Selamat! Anda telah menyelesaikan semua ${LEVELS[level].totalQuestions} pertanyaan! 🏆`, 'success');
        finishGame()
      }, 1000)
    }
  }, [selected, question.answer, qnum, level, gameStarted, nextQuestion, finishGame])

  const restartGame = useCallback(() => {
    resetAll()
    startGame()
    showAlert('Game dimulai ulang! Semangat! 🚀', 'info');
  }, [resetAll, startGame])

  const newGame = useCallback(() => {
    resetAll()
    showAlert('Game baru dimulai! Masukkan nama untuk bermain lagi.', 'info');
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus()
      }
    }, 100)
  }, [resetAll])

  const handleLevelChange = useCallback((e) => {
    setLevel(e.target.value)
    showAlert(`Level diubah menjadi: ${LEVELS[e.target.value].label}`, 'info');
  }, [])

  const handleSelectAnswer = useCallback((choice) => {
    if (gameStarted && running) {
      setSelected(choice)
    }
  }, [gameStarted, running])

  const handleNameChange = useCallback((e) => {
    setPlayerName(e.target.value)
  }, [])

  const handleNameKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      startGame()
    }
  }, [startGame])

  const levelOptions = useMemo(() => 
    Object.entries(LEVELS).map(([k,v]) => (
      <option key={k} value={k}>{v.label}</option>
    ))
  , [])

  const choiceButtons = useMemo(() => 
    question.choices.map((c, i) => (
      <button
        key={i}
        onClick={() => handleSelectAnswer(c)}
        className={
          `text-left p-3 rounded-lg border transition-colors ${
            selected === c 
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
              : 'border-slate-200 bg-white hover:bg-slate-50'
          } ${!gameStarted || !running ? 'opacity-50 cursor-not-allowed' : ''}`
        }
        disabled={!gameStarted || !running}
      >
        {c}
      </button>
    ))
  , [question.choices, selected, handleSelectAnswer, gameStarted, running])

  const progress = useMemo(() => 
    (qnum / LEVELS[level].totalQuestions) * 100
  , [qnum, level])

  if (gameFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl shadow p-6">
            <div className="text-center py-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-4">Selesai☺️</h1>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
                <div className="text-2xl font-bold text-indigo-700 mb-2">{playerName}</div>
                <div className="text-lg text-slate-600">
                  Nilai kamu: <span className="font-bold text-indigo-600">{score}</span> / {LEVELS[level].totalQuestions}
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  Level: {LEVELS[level].label}
                </div>
                <div className="mt-3 text-sm font-medium">
                  {score === LEVELS[level].totalQuestions ? (
                    <span className="text-green-600">🎉Kamu keren bangeeett!</span>
                  ) : score >= LEVELS[level].totalQuestions * 0.8 ? (
                    <span className="text-green-500">👍 Waw kamu bisaaa</span>
                  ) : score >= LEVELS[level].totalQuestions * 0.6 ? (
                    <span className="text-blue-500">😊 Wih kereeeenn!</span>
                  ) : (
                    <span className="text-orange-500">💪 Kamu bisa coba lagi yaaa</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button 
                  onClick={restartGame}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Main lagi
                </button>
                <button 
                  onClick={newGame}
                  className="px-6 py-3 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Mulai dari awal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Quiz Matematika</h1>
              <p className="text-sm text-slate-500">
                {!gameStarted ? `Pilih level dan mulai game - ${LEVELS[level].totalQuestions} pertanyaan` : `Pertanyaan ${qnum} dari ${LEVELS[level].totalQuestions}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Nilai</div>
              <div className="text-lg font-medium text-slate-800">{score}</div>
            </div>
          </div>

          {gameStarted && (
            <div className="mb-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex gap-3 items-center mb-4">
            <label className="text-sm text-slate-600">Level:</label>
            <select 
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={level} 
              onChange={handleLevelChange}
              disabled={gameStarted}
            >
              {levelOptions}
            </select>
            
            {gameStarted && (
              <button 
                onClick={resetAll} 
                className="ml-auto text-sm px-3 py-2 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {!gameStarted ? (
            <div className="text-center py-6">
              <div className="text-xl font-semibold text-slate-800 mb-6">
                Masukkan nama kamu dan mulai game nya
              </div>
              
              <div className="mb-6">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={playerName}
                  onChange={handleNameChange}
                  onKeyPress={handleNameKeyPress}
                  placeholder="Ketik nama kamu di sini... (Enter)"
                  className="w-full max-w-xs mx-auto px-4 py-3 border border-slate-300 rounded-xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-gray-600"
                  maxLength={20}
                />
              </div>

              <div className="text-sm text-slate-600 mb-6">
                Level: <strong>{LEVELS[level].label}</strong> • {LEVELS[level].totalQuestions} pertanyaan • {LEVELS[level].time} detik per pertanyaan
              </div>
              
              <button 
                onClick={startGame}
                disabled={!playerName.trim()}
                className={`px-8 py-4 text-white text-lg font-semibold rounded-xl transition-colors shadow-lg ${
                  playerName.trim() 
                    ? 'bg-gray-400 hover:bg-gray-700' 
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                {playerName.trim() ? `Mulai` : 'Masukkan nama dulu yaa'}
              </button>
            </div>
          ) : (
            <>
              <div className="p-6 rounded-xl border border-slate-100 mb-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-500">Pertanyaan #{qnum}</div>
                  <div className="text-sm text-slate-500">Time</div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-semibold text-slate-800">{question.text} = ?</div>
                  <div className={`text-lg font-mono ${timeLeft < 10 ? 'text-red-500' : 'text-slate-700'}`}>
                    {timeLeft}s
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {choiceButtons}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={submit} 
                  className="flex-1 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  disabled={selected === null || !running}
                >
                  Jawab
                </button>
                <button 
                  onClick={nextQuestion} 
                  className="flex-1 py-2 rounded-md bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  Skip
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          made with❤️
        </div>
      </div>
    </div>
  )
}