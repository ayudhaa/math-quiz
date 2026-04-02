import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Notify } from 'notiflix';

const LEVELS = {
  gampang: {label: 'Gampang', ops: ['+','-','kuadrat'], a:[1,20], b:[1,20], time:30, totalQuestions: 8},
  lumayan: {label: 'Lumayan', ops: ['*','/','linear'], a:[1,12], b:[1,12], time:35, totalQuestions: 8},
  susah: {label: 'Susah', ops: ['+','-','*','/','word','hard_division'], a:[1,100], b:[1,50], time:50, totalQuestions: 10},
}

// Konfigurasi Notiflix
Notify.init({
  width: '300px',
  position: 'center-top',
  distance: '20px',
  opacity: 1,
  borderRadius: '12px',
  timeout: 2500,
  cssAnimation: true,
  cssAnimationDuration: 400,
  cssAnimationStyle: 'fade',
  useIcon: true,
  fontSize: '15px',
  fontFamily: 'Inter, sans-serif',
  success: { background: '#10b981', textColor: '#fff' },
  failure: { background: '#f43f5e', textColor: '#fff' },
  info: { background: '#6366f1', textColor: '#fff' },
  warning: { background: '#f59e0b', textColor: '#fff' },
});

function randInt(min,max){ 
  return Math.floor(Math.random()*(max-min+1))+min 
}

function generateHardDivision() {
  const types = [
    () => {
      const divisor = randInt(3, 15);
      const quotient = randInt(5, 20);
      const remainder = randInt(1, divisor - 1);
      const dividend = divisor * quotient + remainder;
      return {
        problem: `${dividend} ÷ ${divisor} = ?`,
        answer: quotient,
        explanation: `${dividend} ÷ ${divisor} = ${quotient} sisa ${remainder}.`
      };
    },
    () => {
      const divisor = randInt(6, 12);
      const quotient = randInt(20, 50);
      const dividend = divisor * quotient;
      return {
        problem: `${dividend} ÷ ${divisor} = ?`,
        answer: quotient,
        explanation: `${dividend} ÷ ${divisor} = ${quotient}`
      };
    }
  ];
  return types[Math.floor(Math.random() * types.length)]();
}

class MathProblemGenerator {
  static generateWordProblem() {
    const problemTypes = [
      () => {
        const speed = randInt(40, 80);
        const time = randInt(2, 6);
        return {
          problem: `Kecepatan ${speed} km/jam selama ${time} jam. Berapa jaraknya?`,
          answer: speed * time,
          explanation: `${speed} × ${time} = ${speed * time} km`
        };
      },
      () => {
        const length = randInt(5, 20);
        const width = randInt(3, 15);
        return {
          problem: `Panjang ${length} cm, lebar ${width} cm. Berapa luasnya?`,
          answer: length * width,
          explanation: `${length} × ${width} = ${length * width} cm²`
        };
      }
    ];
    return problemTypes[Math.floor(Math.random() * problemTypes.length)]();
  }
}

async function generateQuestion(levelKey){
  const cfg = LEVELS[levelKey]
  const op = cfg.ops[Math.floor(Math.random()*cfg.ops.length)]
  let a, b, answer, text, type = op
  
  switch(op) {
    case '+':
      a = randInt(...cfg.a); b = randInt(...cfg.b);
      answer = a + b; text = `${a} + ${b}`;
      break;
    case '-':
      a = randInt(...cfg.a); b = randInt(...cfg.b);
      if(b > a) [a, b] = [b, a];
      answer = a - b; text = `${a} - ${b}`;
      break;
    case '*':
      a = randInt(...cfg.a); b = randInt(...cfg.b);
      answer = a * b; text = `${a} × ${b}`;
      break;
    case '/':
      b = randInt(...cfg.b); answer = randInt(...cfg.a); a = b * answer;
      text = `${a} ÷ ${b}`;
      break;
    case 'kuadrat':
      a = randInt(...cfg.a); answer = a * a; text = `${a}²`;
      break;
    case 'linear':
      const x = randInt(1, 10); a = randInt(2, 5); b = randInt(1, 20);
      const res = a * x + b; answer = x; text = `${a}x + ${b} = ${res}, x = ?`;
      break;
    case 'word':
      const wp = MathProblemGenerator.generateWordProblem();
      text = wp.problem; answer = wp.answer;
      break;
    case 'hard_division':
      const hd = generateHardDivision();
      text = hd.problem; answer = hd.answer;
      break;
    default:
      a = 10; b = 10; answer = 20; text = "10 + 10";
  }
  
  const choices = [answer]
  const usedNumbers = new Set([answer])
  while(choices.length < 4){
    let cand = answer + randInt(-10, 10)
    if (cand === answer || cand < 0) cand = answer + 1
    if(!usedNumbers.has(cand)) {
        usedNumbers.add(cand)
        choices.push(cand)
    }
  }
  return { text, answer, choices: choices.sort(() => Math.random() - 0.5), type }
}

export default function App(){
  const [level, setLevel] = useState(() => localStorage.getItem('quiz_level') || 'gampang')
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('quiz_playerName') || '')
  
  const [score, setScore] = useState(0)
  const [qnum, setQnum] = useState(1)
  const [question, setQuestion] = useState({ text: '...', answer: 0, choices: [], type: 'basic' })
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(LEVELS[level].time)
  const [running, setRunning] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [loading, setLoading] = useState(false)

  const nameInputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('quiz_level', level);
    localStorage.setItem('quiz_playerName', playerName);
  }, [level, playerName]);

  const generateQuestionOptimized = useCallback(async (levelKey) => {
    setLoading(true)
    try {
      const newQuestion = await generateQuestion(levelKey)
      setQuestion(newQuestion)
    } catch (error) {
      setQuestion({ text: '10 + 10', answer: 20, choices: [18, 19, 20, 21], type: 'basic' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!gameStarted) generateQuestionOptimized(level)
  }, [level, generateQuestionOptimized, gameStarted])

  const startGame = useCallback(() => {
    if (!playerName.trim()) {
      Notify.warning('Masukkan nama kamu dulu ya!');
      return
    }
    setGameStarted(true)
    setRunning(true)
    setTimeLeft(LEVELS[level].time)
    Notify.info(`Selamat bermain, ${playerName}! 🚀`);
  }, [level, playerName])

  // Fungsi untuk menangani tekanan tombol Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      startGame();
    }
  };

  const finishGame = useCallback(() => {
    setRunning(false)
    setGameFinished(true)
  }, [])

  const nextQuestion = useCallback(async () => {
    if (qnum < LEVELS[level].totalQuestions) {
      await generateQuestionOptimized(level)
      setSelected(null)
      setQnum(prev => prev + 1)
      setTimeLeft(LEVELS[level].time)
      setRunning(true)
    } else {
      finishGame()
    }
  }, [qnum, level, generateQuestionOptimized, finishGame])

  const submit = useCallback(() => {
    if(selected === null || !gameStarted || loading) return
    const isCorrect = Number(selected) === question.answer
    if(isCorrect) {
      setScore(prev => prev + 1)
      Notify.success('Benar! Mantap 🎉');
    } else {
      Notify.failure(`Salah! Jawaban yang benar: ${question.answer}`);
    }
    setTimeout(() => nextQuestion(), 1200)
  }, [selected, question, gameStarted, nextQuestion, loading])

  useEffect(() => {
    if(!running || !gameStarted || loading) return
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if(prev <= 1) { nextQuestion(); return LEVELS[level].time }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerId)
  }, [running, gameStarted, level, nextQuestion, loading])

  if (gameFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Game Selesai!</h1>
          {/* Menampilkan nama di layar akhir */}
          <p className="text-slate-500 mb-6 font-medium">Yeayy, <span className="text-indigo-600 font-bold">{playerName}</span> skor akhir kamu:</p>
          <div className="text-6xl font-black text-indigo-600 mb-8">{score}/{LEVELS[level].totalQuestions}</div>
          <button 
            onClick={() => { setScore(0); setQnum(1); setGameFinished(false); setGameStarted(false); }} 
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Main Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 font-sans">
      <div className="w-full max-w-2xl">
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quiz Matematika</h1>
              <p className="text-xs text-slate-400 font-medium tracking-widest mt-1">
                {!gameStarted ? 'Udah siap ?' : `Soal ${qnum} / ${LEVELS[level].totalQuestions}`}
              </p>
            </div>
            <div className="bg-indigo-50 px-4 py-2 rounded-xl text-center">
              <div className="text-[10px] text-indigo-400 font-bold">Skor</div>
              <div className="text-xl font-black text-indigo-600">{score}</div>
            </div>
          </div>

          {!gameStarted ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(LEVELS).map(([k,v]) => (
                  <button 
                    key={k} 
                    onClick={() => setLevel(k)} 
                    className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${level === k ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-50 text-slate-400 hover:border-slate-200'}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <input 
                ref={nameInputRef}
                type="text" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)} 
                onKeyDown={handleKeyDown}
                placeholder="Siapa nama kamu ?" 
                className="w-full px-4 py-4 border border-slate-100 bg-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-center font-semibold text-slate-700 transition-all"
              />
              <button 
                onClick={startGame} 
                className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
              >
                MULAI
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-1000 ease-linear" 
                  style={{ width: `${(timeLeft / LEVELS[level].time) * 100}%` }} 
                />
              </div>

              <div className="py-6 text-center">
                <div className="text-4xl sm:text-6xl font-black text-slate-800 mb-2">
                  {loading ? '...' : question.text}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {question.choices.map((c, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelected(c)}
                    className={`py-5 rounded-2xl border-2 font-bold text-lg transition-all ${selected === c ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-50 hover:border-indigo-100 text-slate-500 bg-white'}`}
                  >
                    {c.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={submit} 
                  disabled={selected === null || loading}
                  className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-100"
                >
                  KONFIRMASI
                </button>
                <button 
                  onClick={nextQuestion}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  LEWATI
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-10 text-center">
          <p className="text-[10px] text-slate-300 font-bold tracking-[0.3em]">made with❤️</p>
        </div>
      </div>
    </div>
  )
}