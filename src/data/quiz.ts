
export type Answer = {
  questionId: number;
  value: string | string[] | number;
};

export type QuizQuestion = {
  id: number;
  type: 'single-choice' | 'single-choice-column'| 'multiple-choice' | 'text'| 'number' | 'promise' | 'testimonial' | 'loading' | 'weight-slider' | 'height-slider';
  question: string;
  subtitle?: string;
  options?: { label: string; sublabel?: string; imageUrl?: string, icon?: string, emoji?: string }[];
  placeholder?: string;
  buttonText?: string;
  autoAdvance?: boolean;
  imageUrl?: string;
  testimonial?: {
    title: string;
    name: string;
    handle: string;
    text: string;
    beforeImageUrl?: string;
    afterImageUrl?: string;
  };
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    type: 'single-choice',
    question: 'Quantos quilos você deseja perder?',
    subtitle: 'O protocolo Mounjaro de Pobre ajuda a eliminar gordura de forma acelerada.',
    options: [
      { label: 'Até 5 kg' },
      { label: 'De 6 a 10 kg' },
      { label: 'De 11 a 15 kg' },
      { label: 'De 16 a 20 kg' },
      { label: 'Mais de 20 kg' },
    ],
    autoAdvance: true,
  },
  {
    id: 2,
    type: 'single-choice-column',
    question: 'Como você descreveria seu físico?',
    subtitle: 'Escolha uma opção para continuar.',
    options: [
        { label: 'Regular', imageUrl: '/regular.webp' }, 
        { label: 'Flácido', imageUrl: '/flacido.webp' }, 
        { label: 'Sobrepeso', imageUrl: '/sobrepeso.webp' }
    ],
    autoAdvance: true,
  },
  {
    id: 3,
    type: 'multiple-choice',
    question: 'Em qual área do seu corpo você gostaria de reduzir mais gordura?',
    options: [
      { label: 'Região dos Culetes', imageUrl: '/regiaodosculotes.webp' },
      { label: 'Região das Coxas', imageUrl: '/regiaodascoxas.webp' },
      { label: 'Região do Abdômen (barriga)', imageUrl: '/regiaoabdomen.webp' },
      { label: 'Região dos Gluteos', imageUrl: '/regiaogluteos.webp' },
      { label: 'Região dos Braços', imageUrl: '/regiaodosbracos.webp' },
    ],
    buttonText: 'Continuar',
  },
  {
    id: 4,
    type: 'text',
    question: 'Qual seu nome?',
    subtitle: 'Para montar seu plano personalizado, precisamos do seu nome. Fique tranquila, seus dados estão protegidos🔒',
    placeholder: 'Digite seu nome...',
    buttonText: 'Continuar',
  },
  {
    id: 5,
    type: 'single-choice-column',
    question: 'Como o seu peso impacta sua vida?',
    options: [
      { label: 'Evito tirar fotos porque tenho vergonha', icon: 'Camera' },
      { label: 'Meu parceiro não me olha mais com desejo como antes', icon: 'HeartCrack' },
      { label: 'Evito encontros sociais porque não me sinto bem comigo mesma.', icon: 'Frown' },
      { label: 'Nenhuma das opções.', icon: 'Hand' },
    ],
    autoAdvance: true,
  },
  {
    id: 6,
    type: 'single-choice-column',
    question: 'Você está realmente feliz com sua aparência?',
    options: [
      { label: 'Não, porque me sinto acima do peso', emoji: '😭' },
      { label: 'Sim, mas sei que posso melhorar minha saúde', emoji: '💔' },
      { label: 'Não, gostaria de perder peso para me sentir melhor comigo mesma.', emoji: '😔' },
    ],
    autoAdvance: true,
  },
   {
    id: 7,
    type: 'single-choice-column',
    question: 'O que mais te impede de perder peso?',
    options: [
      { label: 'Falta de tempo', sublabel: 'Rotina agitada.', emoji: '⏰' },
      { label: 'Autocontrole', sublabel: 'Dificuldade em resistir a tentações alimentares.', emoji: '😬' },
      { label: 'Financeiro', sublabel: 'Achar opções saudáveis mais caras do que alimentos processados.', emoji: '💸' },
    ],
    autoAdvance: true,
  },
  {
    id: 8,
    type: 'promise',
    question: 'Nosso protocolo Resolve isso para você!',
    imageUrl: '/monjaro.webp',
    buttonText: 'Continuar',
  },
  {
    id: 9,
    type: 'multiple-choice',
    question: 'Quais desses benefícios você gostaria de ter?',
    subtitle: '📌 Vamos personalizar a sua fórmula para maximizar os resultados.',
    options: [
      { label: 'Emagrecer sem esforço e sem efeito sanfona', emoji: '🔥' },
      { label: 'Sono mais profundo', emoji: '😴' },
      { label: 'Mais energia e disposição ao longo do dia', emoji: '⚡' },
      { label: 'Aumento da autoestima e confiança', emoji: '💪' },
      { label: 'Redução do estresse e ansiedade', emoji: '😌' },
    ],
    buttonText: 'Continuar',
  },
  {
    id: 10,
    type: 'testimonial',
    question: '🔥 Histórias Reais de Transformação!',
    subtitle: '📍 Depoimento: Lorena dos Santos | Porto Alegre-RS',
    imageUrl: '/pir.webp',
    testimonial: {
      title: 'Depoimento: Lorena dos Santos | Porto Alegre-RS',
      name: 'Lorena dos Santos',
      handle: '@lore.dossantos21',
      text: 'Eu já tinha tentado de tudo para emagrecer, mas nada funcionava. Depois de incluir a fórmula do Mounjaro de pobre na minha rotina, perdi 11kg sem mudar nada na minha alimentação! O mais incrível é que minha fome e ansiedade diminuíram naturalmente!',
      beforeImageUrl: 'https://placehold.co/300x300.png',
      afterImageUrl: 'https://placehold.co/300x300.png',
    },
    buttonText: 'Continuar',
  },
  {
    id: 11,
    type: 'weight-slider',
    question: 'Qual é o seu peso atual?',
    subtitle: 'Já estamos quase terminando! Vamos ajustar seu plano de acordo com o seu corpo.',
    options: [
        { label: '', sublabel: 'Já estamos quase terminando! Vamos ajustar seu plano de acordo com o seu corpo.' },
        { label: '', sublabel: 'Com base nisso, vamos ajustar a dose ideal para que você obtenha os melhores resultados.' },
    ],
    buttonText: 'Continuar',
  },
  {
    id: 12,
    type: 'height-slider',
    question: 'Qual é a sua altura?',
    options: [
        { label: 'cm', sublabel: 'Isso vai nos ajudar a calcular a quantidade exata do Mounjaro dos Pobres para seu corpo.' },
        { label: 'pol', sublabel: 'Arraste para ajustar' },
    ],
    buttonText: 'Continuar',
  },
  {
    id: 13,
    type: 'weight-slider',
    question: 'Qual é o seu objetivo de peso (desejado)?',
    subtitle: 'Isso vai nos ajudar a personalizar um plano especificamente para você.',
    options: [
      { label: 'kg', sublabel: 'Isso vai nos ajudar a personalizar um plano especificamente para você.' },
      { label: 'lb', sublabel: 'Com base nisso, vamos ajustar a dose ideal para que você obtenha os melhores resultados.' },
    ],
    buttonText: 'Continuar',
  },
  {
    id: 14,
    type: 'single-choice-column',
    question: 'Como é o seu dia a dia?',
    subtitle: 'Sua rotina diária também influencia!',
    options: [
      { label: 'Trabalho fora e tenho uma rotina agitada', emoji: '🙂' },
      { label: 'Trabalho em casa e tenho uma rotina flexível', emoji: '😏' },
      { label: 'Estou em casa cuidando da família', emoji: '👱‍♀️' },
      { label: 'Outros', emoji: '😐' },
    ],
    autoAdvance: true,
  },
  {
    id: 15,
    type: 'single-choice',
    question: 'Quantas horas você dorme por noite?',
    subtitle: 'A qualidade do seu sono impacta diretamente na sua perda de peso!',
    options: [
      { label: 'Menos de 5 horas', emoji: '🙃' },
      { label: 'Entre 5 e 7 horas', emoji: '🤗' },
      { label: 'Entre 7 e 9 horas', emoji: '👱‍♀️' },
      { label: 'Mais de 9 horas', emoji: '🙂' },
    ],
    autoAdvance: true,
  },
  {
    id: 16,
    type: 'single-choice',
    question: 'Quantos copos de água você bebe por dia?',
    subtitle: 'Seu nível de hidratação também influencia na sua perda de peso.',
    options: [
      { label: '1-2 copos por dia' },
      { label: '2-6 copos por dia' },
      { label: 'Mais de 6 copos por dia' },
    ],
    autoAdvance: true,
  },
  {
    id: 17,
    type: 'loading',
    question: 'Aguarde enquanto preparamos o seu Mounjaro dos Pobres…',
    subtitle: 'Analisando as suas respostas...',
  },
];
