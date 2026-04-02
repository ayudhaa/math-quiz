import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Notify } from 'notiflix';

const LEVELS = {
  gampang: {label: 'Gampang', ops: ['+','-','kuadrat'], a:[1,20], b:[1,20], time:30, totalQuestions: 8},
  lumayan: {label: 'Lumayan', ops: ['*','/','linear'], a:[1,12], b:[1,12], time:35, totalQuestions: 8},
  susah: {label: 'Susah', ops: ['+','-','*','/','word','hard_division'], a:[1,100], b:[1,50], time:50, totalQuestions: 10},
}

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
  success: { background: '#94a3b8', textColor: '#fff' },
  failure: { background: '#cbd5e1', textColor: '#1e293b' },
  info: { background: '#a8a29e', textColor: '#fff' },
  warning: { background: '#d6d3d1', textColor: '#1e293b' },
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
      Notify.warning('Nama kamu kosong tuh.. isi dulu yaa😶');
      return
    }
    setGameStarted(true)
    setRunning(true)
    setTimeLeft(LEVELS[level].time)
    Notify.info(`Gaspol, ${playerName}! Good luck yaaa✨`);
  }, [level, playerName])

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
      Notify.success('Cakep, bener banget🔥');
    } else {
      Notify.failure('Yah.. meleset dikit, semangaaat💪');
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

  const getEndMessage = () => {
    const ratio = score / LEVELS[level].totalQuestions;
    if (ratio === 1) return { msg: "Gilaaa, sepuh nih! Skor sempurna🔥", emoji: "🏆" };
    if (ratio >= 0.7) return { msg: "GGWP! Kamu jago banget matematikanya😎🤙", emoji: "✨" };
    if (ratio >= 0.5) return { msg: "Not bad lah, dikit lagi jadi suhu...", emoji: "👍" };
    return { msg: "Tetap semangat! Masih pemanasan ini mah..🏃‍♂️💨", emoji: "❤️" };
  }

  const endMessage = useMemo(() => getEndMessage(), [score, level, gameFinished]);

  if (gameFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-100 p-8 text-center">
          <div className="text-5xl mb-4">{endMessage.emoji}</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Game selesai</h1>
          <p className="text-slate-500 mb-2 font-medium">
            Halo <span className="text-stone-600 font-bold">{playerName}</span>, skor akhir kamu:
          </p>
          <div className="text-7xl font-black text-stone-700 mb-6">{score}/{LEVELS[level].totalQuestions}</div>
          <p className="text-slate-400 italic mb-8 px-4">{endMessage.msg}</p>
          <button 
            onClick={() => { setScore(0); setQnum(1); setGameFinished(false); setGameStarted(false); }} 
            className="w-full py-4 bg-stone-700 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-100"
          >
            Main lagi kuy🔄
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#fcfcfc] font-sans">
      <div className="w-full max-w-2xl">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-50 p-6 sm:p-10">
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-2xl font-black text-slate-700 tracking-tight">Math Quiz✏️</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                {!gameStarted ? 'Udah siap seru-seruan?' : `Soal ke ${qnum} 🔥`}
              </p>
            </div>
            <div className="bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 text-center">
              <div className="text-[10px] text-slate-400 font-black uppercase">Points</div>
              <div className="text-xl font-black text-slate-600">{score}</div>
            </div>
          </div>

          {!gameStarted ? (
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(LEVELS).map(([k,v]) => (
                  <button 
                    key={k} 
                    onClick={() => setLevel(k)} 
                    className={`py-4 rounded-2xl border-2 text-xs font-black transition-all ${level === k ? 'border-stone-400 bg-stone-50 text-stone-700 shadow-inner' : 'border-slate-50 text-slate-300 hover:border-slate-100'}`}
                  >
                    {v.label.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input 
                  ref={nameInputRef}
                  type="text" 
                  value={playerName} 
                  onChange={(e) => setPlayerName(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik nama kamu di sini.." 
                  className="w-full px-6 py-5 border-2 border-slate-50 bg-slate-50/50 rounded-2xl focus:border-stone-200 focus:bg-white outline-none text-center font-bold text-slate-600 transition-all placeholder:text-slate-300"
                />
              </div>
              <button 
                onClick={startGame} 
                className="w-full py-5 bg-stone-800 text-white font-black rounded-2xl hover:bg-black transition-all shadow-2xl shadow-stone-200 active:scale-95"
              >
                Gasss, mulai🚀
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-50">
                <div 
                  className="bg-stone-400 h-full transition-all duration-1000 ease-linear" 
                  style={{ width: `${(timeLeft / LEVELS[level].time) * 100}%` }} 
                />
              </div>

              <div className="py-8 text-center">
                <div className="text-5xl sm:text-7xl font-black text-slate-700 leading-tight">
                  {loading ? '...' : question.text}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {question.choices.map((c, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelected(c)}
                    className={`py-6 rounded-[1.5rem] border-2 font-black text-xl transition-all ${selected === c ? 'border-stone-500 bg-stone-50 text-stone-700 shadow-lg' : 'border-slate-50 hover:border-slate-100 text-slate-400 bg-white'}`}
                  >
                    {c.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={submit} 
                  disabled={selected === null || loading}
                  className="flex-[2] py-5 bg-stone-700 text-white font-black rounded-2xl hover:bg-stone-800 transition-all disabled:opacity-30 shadow-xl shadow-stone-100"
                >
                  Yakin, jawab✅
                </button>
                <button 
                  onClick={nextQuestion}
                  className="flex-1 py-5 bg-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Skip⏭️
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-12 text-center">
          <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">made with❤️</p>
        </div>
      </div>
    </div>
  )
}