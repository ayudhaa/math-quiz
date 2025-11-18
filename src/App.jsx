import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Notify } from 'notiflix';

const LEVELS = {
  gampang: {label: 'Gampang', ops: ['+','-'], a:[1,20], b:[1,20], time:30, totalQuestions: 8},
  lumayan: {label: 'Lumayan', ops: ['*','/','linear'], a:[1,12], b:[1,12], time:35, totalQuestions: 8},
  susah: {label: 'Susah', ops: ['+','-','*','/','word'], a:[1,100], b:[1,50], time:50, totalQuestions: 8},
}

Notify.init({
  timeout: 2000,
  clickToClose: true,
});

function randInt(min,max){ 
  return Math.floor(Math.random()*(max-min+1))+min 
}


class MathProblemGenerator {
  static generateWordProblem() {
    const problemTypes = [
      
      () => {
        const price = randInt(50, 200) * 1000;
        const discount = randInt(10, 30);
        const finalPrice = Math.round(price * (100 - discount) / 100);
        return {
          problem: `Sebuah produk dijual dengan harga Rp ${price.toLocaleString('id-ID')}. Jika ada diskon ${discount}%, berapa harga setelah diskon?`,
          answer: finalPrice,
          explanation: `Diskon = ${discount}% × ${price.toLocaleString('id-ID')} = ${(price * discount / 100).toLocaleString('id-ID')}. Harga akhir = ${price.toLocaleString('id-ID')} - ${(price * discount / 100).toLocaleString('id-ID')} = Rp ${finalPrice.toLocaleString('id-ID')}`
        };
      },
      
      
      () => {
        const speed = randInt(40, 80);
        const time = randInt(2, 6);
        const distance = speed * time;
        return {
          problem: `Sebuah kendaraan bergerak dengan kecepatan ${speed} km/jam selama ${time} jam. Berapa jarak yang ditempuh?`,
          answer: distance,
          explanation: `Jarak = Kecepatan × Waktu = ${speed} × ${time} = ${distance} km`
        };
      },
      
      
      () => {
        const length = randInt(5, 20);
        const width = randInt(3, 15);
        const area = length * width;
        return {
          problem: `Sebuah persegi panjang memiliki panjang ${length} cm dan lebar ${width} cm. Berapa luasnya?`,
          answer: area,
          explanation: `Luas = Panjang × Lebar = ${length} × ${width} = ${area} cm²`
        };
      },
      
      
      () => {
        const side = randInt(5, 15);
        const perimeter = 4 * side;
        return {
          problem: `Sebuah persegi memiliki sisi ${side} cm. Berapa kelilingnya?`,
          answer: perimeter,
          explanation: `Keliling persegi = 4 × Sisi = 4 × ${side} = ${perimeter} cm`
        };
      },
      
      
      () => {
        const ratio1 = randInt(2, 5);
        const ratio2 = randInt(2, 5);
        const total = randInt(30, 100);
        const part1 = Math.round(total * ratio1 / (ratio1 + ratio2));
        return {
          problem: `Perbandingan uang A dan B adalah ${ratio1}:${ratio2}. Jika total uang mereka Rp ${total.toLocaleString('id-ID')}, berapa uang A?`,
          answer: part1,
          explanation: `Jumlah perbandingan = ${ratio1 + ratio2}. Uang A = (${ratio1} / ${ratio1 + ratio2}) × ${total.toLocaleString('id-ID')} = Rp ${part1.toLocaleString('id-ID')}`
        };
      },
      
      
      () => {
        const num1 = randInt(10, 50);
        const num2 = randInt(5, 25);
        const sum = num1 + num2;
        return {
          problem: `Ibu membeli ${num1} apel dan ${num2} jeruk. Berapa total buah yang dibeli ibu?`,
          answer: sum,
          explanation: `Total = Apel + Jeruk = ${num1} + ${num2} = ${sum} buah`
        };
      },
      
      
      () => {
        const radius = randInt(3, 8);
        const height = randInt(5, 12);
        const volume = Math.round(Math.PI * radius * radius * height);
        return {
          problem: `Sebuah tabung memiliki jari-jari ${radius} cm dan tinggi ${height} cm. Berapa volumenya? (π = 3.14)`,
          answer: volume,
          explanation: `Volume = π × r² × t = 3.14 × ${radius}² × ${height} = 3.14 × ${radius * radius} × ${height} = ${volume} cm³`
        };
      },
      
      
      () => {
        const ageNow = randInt(20, 40);
        const yearsLater = randInt(5, 15);
        const futureAge = ageNow + yearsLater;
        return {
          problem: `Sekarang Andi berumur ${ageNow} tahun. Berapa umur Andi ${yearsLater} tahun yang akan datang?`,
          answer: futureAge,
          explanation: `Umur ${yearsLater} tahun lagi = Umur sekarang + ${yearsLater} = ${ageNow} + ${yearsLater} = ${futureAge} tahun`
        };
      },
      
      
      () => {
        const principal = randInt(1000, 5000) * 1000;
        const rate = randInt(5, 15);
        const time = randInt(1, 3);
        const interest = Math.round((principal * rate * time) / 100);
        const total = principal + interest;
        return {
          problem: `Pak Budi menabung Rp ${principal.toLocaleString('id-ID')} dengan bunga ${rate}% per tahun. Berapa total tabungan setelah ${time} tahun?`,
          answer: total,
          explanation: `Bunga = (Modal × Bunga × Waktu) / 100 = (${principal.toLocaleString('id-ID')} × ${rate} × ${time}) / 100 = ${interest.toLocaleString('id-ID')}. Total = Modal + Bunga = ${principal.toLocaleString('id-ID')} + ${interest.toLocaleString('id-ID')} = Rp ${total.toLocaleString('id-ID')}`
        };
      },
      
      
      () => {
        const scale = randInt(2, 10) * 10000;
        const mapDistance = randInt(2, 8);
        const actualDistance = mapDistance * scale / 1000; 
        return {
          problem: `Pada peta dengan skala 1:${scale.toLocaleString('id-ID')}, jarak dua kota adalah ${mapDistance} cm. Berapa jarak sebenarnya?`,
          answer: actualDistance,
          explanation: `Jarak sebenarnya = Jarak peta × Skala = ${mapDistance} cm × ${scale.toLocaleString('id-ID')} = ${(mapDistance * scale / 100000).toLocaleString('id-ID')} km = ${actualDistance} km`
        };
      },
      
      
      () => {
        const num1 = randInt(70, 85);
        const num2 = randInt(75, 90);
        const num3 = randInt(80, 95);
        const average = Math.round((num1 + num2 + num3) / 3);
        return {
          problem: `Nilai matematika Ana: ${num1}, Budi: ${num2}, dan Cici: ${num3}. Berapa rata-rata nilai mereka?`,
          answer: average,
          explanation: `Rata-rata = (${num1} + ${num2} + ${num3}) ÷ 3 = ${num1 + num2 + num3} ÷ 3 = ${average}`
        };
      },
      
      
      () => {
        const startHour = randInt(7, 10);
        const duration = randInt(2, 5);
        const endHour = startHour + duration;
        return {
          problem: `Acara dimulai pukul ${startHour}.00 dan berlangsung ${duration} jam. Pukul berapa acara selesai?`,
          answer: endHour,
          explanation: `Waktu selesai = Waktu mulai + Durasi = ${startHour}.00 + ${duration} jam = pukul ${endHour}.00`
        };
      },
      
      
      () => {
        const numerator = randInt(1, 4);
        const denominator = randInt(2, 6);
        const whole = randInt(2, 5);
        const total = whole * denominator + numerator;
        return {
          problem: `Ibu memiliki ${whole} ${denominator !== 1 ? ` ${numerator}/${denominator}` : ''} kue. Berapa total kue dalam bentuk pecahan?`,
          answer: total,
          explanation: `${whole} ${denominator !== 1 ? ` ${numerator}/${denominator}` : ''} = (${whole} × ${denominator}) + ${numerator} = ${total} kue`
        };
      },
      
      
      () => {
        const rate = randInt(10, 30);
        const time = randInt(2, 6);
        const volume = rate * time;
        return {
          problem: `Sebuah keran memiliki debit ${rate} liter/menit. Berapa liter air yang keluar dalam ${time} menit?`,
          answer: volume,
          explanation: `Volume = Debit × Waktu = ${rate} liter/menit × ${time} menit = ${volume} liter`
        };
      },
      
      
      () => {
        const totalPrice = randInt(20, 50) * 1000;
        const quantity = randInt(4, 10);
        const unitPrice = Math.round(totalPrice / quantity);
        return {
          problem: `${quantity} buku harganya Rp ${totalPrice.toLocaleString('id-ID')}. Berapa harga satu buku?`,
          answer: unitPrice,
          explanation: `Harga satuan = Total harga ÷ Jumlah = ${totalPrice.toLocaleString('id-ID')} ÷ ${quantity} = Rp ${unitPrice.toLocaleString('id-ID')}`
        };
      },
      
      
      () => {
        const smallWeight = randInt(1, 5);
        const largeWeight = randInt(10, 20);
        const totalWeight = smallWeight + largeWeight;
        return {
          problem: `Sebuah paket kecil beratnya ${smallWeight} kg dan paket besar ${largeWeight} kg. Berapa total berat kedua paket?`,
          answer: totalWeight,
          explanation: `Total berat = Berat kecil + Berat besar = ${smallWeight} + ${largeWeight} = ${totalWeight} kg`
        };
      },
      
      
      () => {
        const angle1 = randInt(30, 60);
        const angle2 = randInt(40, 70);
        const angle3 = 180 - angle1 - angle2;
        return {
          problem: `Dua sudut segitiga adalah ${angle1}° dan ${angle2}°. Berapa sudut ketiganya?`,
          answer: angle3,
          explanation: `Jumlah sudut segitiga = 180°. Sudut ketiga = 180° - ${angle1}° - ${angle2}° = ${angle3}°`
        };
      },
      
      
      () => {
        const buyPrice = randInt(50, 100) * 1000;
        const sellPrice = randInt(60, 120) * 1000;
        const profit = sellPrice - buyPrice;
        return {
          problem: `Sebuah barang dibeli dengan harga Rp ${buyPrice.toLocaleString('id-ID')} dan dijual Rp ${sellPrice.toLocaleString('id-ID')}. Berapa keuntungannya?`,
          answer: profit,
          explanation: `Keuntungan = Harga jual - Harga beli = ${sellPrice.toLocaleString('id-ID')} - ${buyPrice.toLocaleString('id-ID')} = Rp ${profit.toLocaleString('id-ID')}`
        };
      }
    ];

    const randomType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    return randomType();
  }
}

async function generateQuestion(levelKey){
  const cfg = LEVELS[levelKey]
  const op = cfg.ops[Math.floor(Math.random()*cfg.ops.length)]
  let a, b, answer, text, type = op
  
  switch(op) {
    case '+':
      a = randInt(...cfg.a)
      b = randInt(...cfg.b)
      answer = a + b
      text = `${a} + ${b}`
      break
    case '-':
      a = randInt(...cfg.a)
      b = randInt(...cfg.b)
      if(b > a) [a, b] = [b, a]
      answer = a - b
      text = `${a} - ${b}`
      break
    case '*':
      a = randInt(...cfg.a)
      b = randInt(...cfg.b)
      answer = a * b
      text = `${a} × ${b}`
      break
    case '/':
      b = randInt(...cfg.b)
      answer = randInt(1, Math.min(...cfg.a))
      a = b * answer
      text = `${a} ÷ ${b}`
      break
    case 'linear':
      const coef = randInt(2, 6)
      const constant = randInt(1, 10)
      const result = coef * randInt(2, 8) + constant
      answer = (result - constant) / coef
      text = `${coef}x + ${constant} = ${result}`
      break
    case 'word':
      
      const wordProblem = MathProblemGenerator.generateWordProblem();
      text = wordProblem.problem;
      answer = wordProblem.answer;
      type = 'word';
      break
    default:
      a = randInt(...cfg.a)
      b = randInt(...cfg.b)
      answer = a + b
      text = `${a} + ${b}`
  }
  
  const choices = [answer]
  const usedNumbers = new Set([answer])
  
  while(choices.length < 4){
    let cand
    let attempts = 0
    
    do {
      if (type === 'word' && answer > 1000) {
        cand = answer + randInt(-Math.floor(answer * 0.2), Math.floor(answer * 0.2))
      } else if (type === 'word') {
        cand = answer + randInt(-Math.max(2, Math.floor(answer * 0.3)), Math.max(2, Math.floor(answer * 0.3)))
      } else {
        const delta = Math.max(1, Math.round(Math.abs(answer)*0.2))
        cand = answer + randInt(-delta, delta)
      }
      
      if (cand < 0 && type !== 'linear') cand = Math.abs(cand)
      if (cand === answer) cand += 1
      
      attempts++
      if(attempts > 15) {
        cand = answer + (cand > answer ? 1 : -1) * randInt(1, 5)
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
  
  return { text, answer, choices, type }
}

const showAlert = (message, type = 'info') => {
  switch(type) {
    case 'success':
      Notify.success(message, { timeout: 2000, position: 'center-top' });
      break;
    case 'failure':
      Notify.failure(message, { timeout: 2000, position: 'center-top' });
      break;
    case 'warning':
      Notify.warning(message, { timeout: 2000, position: 'center-top' });
      break;
    case 'info':
      Notify.info(message, { timeout: 2000, position: 'center-top' });
      break;
    default:
      Notify.info(message, { timeout: 2000, position: 'center-top' });
  }
};

export default function App(){
  const [level, setLevel] = useState('gampang')
  const [question, setQuestion] = useState(() => ({ 
    text: '10 + 10', 
    answer: 20, 
    choices: [18, 19, 20, 21], 
    type: 'basic' 
  }))
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [qnum, setQnum] = useState(1)
  const [timeLeft, setTimeLeft] = useState(LEVELS[level].time)
  const [running, setRunning] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [currentExplanation, setCurrentExplanation] = useState('')
  const [loading, setLoading] = useState(false)

  const nameInputRef = useRef(null)

  const generateQuestionOptimized = useCallback(async (levelKey) => {
    setLoading(true)
    try {
      const newQuestion = await generateQuestion(levelKey)
      setQuestion(newQuestion)
    } catch (error) {
      console.error('Error generating question:', error)
      
      setQuestion({
        text: '10 + 10',
        answer: 20,
        choices: [18, 19, 20, 21],
        type: 'basic'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const resetAll = useCallback(async () => {
    setSelected(null)
    setScore(0)
    setQnum(1)
    setTimeLeft(LEVELS[level].time)
    setRunning(false)
    setGameStarted(false)
    setGameFinished(false)
    setShowExplanation(false)
    setCurrentExplanation('')
    await generateQuestionOptimized(level)
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

  const nextQuestion = useCallback(async () => {
    if (qnum < LEVELS[level].totalQuestions) {
      await generateQuestionOptimized(level)
      setSelected(null)
      setQnum(prev => prev + 1)
      setTimeLeft(LEVELS[level].time)
      setRunning(true)
      setShowExplanation(false)
      setCurrentExplanation('')
    } else {
      finishGame()
    }
  }, [qnum, level, generateQuestionOptimized, finishGame])

  useEffect(() => {
    if(!running || !gameStarted || loading) return
    
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if(prevTime <= 1) {
          if (qnum < LEVELS[level].totalQuestions) {
            showAlert('Waktu habis! Melanjutkan ke pertanyaan berikutnya.', 'warning');
            nextQuestion()
          } else {
            showAlert(`Yeayy kamu udah selesain semua pertanyaan.`, 'success');
            finishGame()
          }
          return LEVELS[level].time
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [running, gameStarted, level, qnum, nextQuestion, finishGame, loading])

  const startGame = useCallback(async () => {
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

  const submit = useCallback(async () => {
    if(selected === null || !gameStarted || loading) {
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
      showAlert(`Jawaban salah! Yang benar: ${formatChoice(question.answer)}`, 'failure');
      
      
      if (question.type === 'word') {
        const wordProblem = MathProblemGenerator.generateWordProblem();
        setCurrentExplanation(`Jawabannya adalah ${formatChoice(question.answer)}. ${wordProblem.explanation || ''}`)
        setShowExplanation(true)
      }
    }
    
    const delay = question.type === 'word' ? 3000 : 1500
    if (qnum < LEVELS[level].totalQuestions) {
      setTimeout(() => {
        nextQuestion()
      }, delay)
    } else {
      setTimeout(() => {
        showAlert(`Yeayy kamu udah selesain semua ${LEVELS[level].totalQuestions} pertanyaan! 🏆`, 'success');
        finishGame()
      }, delay)
    }
  }, [selected, question.answer, question.type, qnum, level, gameStarted, nextQuestion, finishGame, loading])

  const restartGame = useCallback(async () => {
    await resetAll()
    startGame()
    showAlert('Game dimulai ulang! Semangat! 🚀', 'info');
  }, [resetAll, startGame])

  const newGame = useCallback(async () => {
    await resetAll()
    showAlert('Game baru dimulai! Masukkan nama untuk bermain lagi.', 'info');
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus()
      }
    }, 100)
  }, [resetAll])

  const handleLevelChange = useCallback((e) => {
    setLevel(e.target.value)
    showAlert(`Levelnya diubah: ${LEVELS[e.target.value].label}`, 'info');
  }, [])

  const handleSelectAnswer = useCallback((choice) => {
    if (gameStarted && running && !loading) {
      setSelected(choice)
    }
  }, [gameStarted, running, loading])

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

  const formatChoice = (choice) => {
    if (choice > 1000) {
      return choice.toLocaleString('id-ID')
    }
    return choice
  }

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
          } ${(!gameStarted || !running || loading) ? 'opacity-50 cursor-not-allowed' : ''}`
        }
        disabled={!gameStarted || !running || loading}
      >
        {formatChoice(c)}
      </button>
    ))
  , [question.choices, selected, handleSelectAnswer, gameStarted, running, loading])

  const progress = useMemo(() => 
    (qnum / LEVELS[level].totalQuestions) * 100
  , [qnum, level])

  
  const TimerDisplay = useMemo(() => (
    <div className={`
      flex items-center justify-center 
      px-3 py-2 rounded-lg font-mono font-bold
      ${timeLeft < 10 
        ? 'bg-red-100 text-red-700 border border-red-300' 
        : 'bg-slate-100 text-slate-700 border border-slate-300'
      }
      transition-all duration-300
      text-sm sm:text-base
      min-w-[60px] sm:min-w-[80px]
    `}>
      <span className="sm:hidden mr-1">⏱️</span>
      <span className={`${timeLeft < 10 ? 'animate-pulse' : ''}`}>
        {timeLeft}s
      </span>
    </div>
  ), [timeLeft])

  if (gameFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl mx-4">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl shadow p-4 sm:p-6">
            <div className="text-center py-6 sm:py-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">Selesai☺️</h1>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 sm:p-6 mb-6">
                <div className="text-xl sm:text-2xl font-bold text-indigo-700 mb-2">{playerName}</div>
                <div className="text-base sm:text-lg text-slate-600">
                  Nilai kamu: <span className="font-bold text-indigo-600">{score}</span> / {LEVELS[level].totalQuestions}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-2">
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

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={restartGame}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                  Main lagi
                </button>
                <button 
                  onClick={newGame}
                  className="px-6 py-3 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors text-sm sm:text-base"
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Quiz Matematika</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {!gameStarted ? `Pilih level dan mulai game - ${LEVELS[level].totalQuestions} pertanyaan` : `Pertanyaan ${qnum} dari ${LEVELS[level].totalQuestions}`}
                {loading && " (Loading...)"}
              </p>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-right">
                <div className="text-xs sm:text-sm text-slate-500">Nilai</div>
                <div className="text-lg sm:text-xl font-medium text-slate-800">{score}</div>
              </div>
              
              {gameStarted && TimerDisplay}
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

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">Level:</label>
              <select 
                className="flex-1 px-3 py-2 border rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={level} 
                onChange={handleLevelChange}
                disabled={gameStarted || loading}
              >
                {levelOptions}
              </select>
            </div>
            
            {gameStarted && (
              <button 
                onClick={resetAll} 
                className="sm:ml-auto text-xs sm:text-sm px-3 py-2 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Mulai ulang
              </button>
            )}
          </div>

          {!gameStarted ? (
            <div className="text-center py-4 sm:py-6"><div className="mb-4 sm:mb-6">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={playerName}
                  onChange={handleNameChange}
                  onKeyPress={handleNameKeyPress}
                  placeholder="Ketik nama kamu di sini... (Enter)"
                  className="w-full max-w-xs mx-auto px-4 py-3 border border-slate-300 rounded-xl text-center text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-gray-600"
                  maxLength={20}
                />
              </div>

              <div className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
                Level: <strong>{LEVELS[level].label}</strong> • {LEVELS[level].totalQuestions} pertanyaan • {LEVELS[level].time} detik per pertanyaan
                {level === 'susah' && <span className="text-indigo-600"> • 18 variasi soal cerita</span>}
              </div>
              
              <button 
                onClick={startGame}
                disabled={!playerName.trim() || loading}
                className={`px-6 sm:px-8 py-3 sm:py-4 text-white text-base sm:text-lg font-semibold rounded-xl transition-colors shadow-lg ${
                  playerName.trim() && !loading
                    ? 'bg-gray-400 hover:bg-gray-700' 
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Loading...' : (playerName.trim() ? `Mulai` : 'Masukkan nama dulu yaa')}
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 sm:p-6 rounded-xl border border-slate-100 mb-4 bg-white">
                {loading ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-3 sm:mb-4"></div>
                    <div className="text-slate-600 text-sm sm:text-base">Generating question...</div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="text-xs sm:text-sm text-slate-500">
                        Pertanyaan #{qnum}
                      </div>
                      
                      <div className="sm:hidden">
                        {TimerDisplay}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                      <div className="text-lg sm:text-xl font-semibold text-slate-800 leading-relaxed flex-1">
                        {question.text}
                      </div>
                      
                      <div className="hidden sm:block">
                        {TimerDisplay}
                      </div>
                    </div>

                    {showExplanation && currentExplanation && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-xs sm:text-sm text-yellow-800">
                          <strong>Penjelasan:</strong> {currentExplanation}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {choiceButtons}
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button 
                  onClick={submit} 
                  className="flex-1 py-2 sm:py-3 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  disabled={selected === null || !running || loading}
                >
                  {loading ? 'Loading...' : 'Jawab'}
                </button>
                <button 
                  onClick={nextQuestion} 
                  className="flex-1 py-2 sm:py-3 rounded-md bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  disabled={loading}
                >
                  Skip
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 sm:mt-6 text-center text-xs text-slate-400">
          made with❤️
        </div>
      </div>
    </div>
  )
}