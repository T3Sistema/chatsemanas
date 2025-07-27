import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat, Type } from "@google/genai";

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    action?: { type: string } | null;
}

// Função para obter a saudação baseada na hora do dia
const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
        return 'Bom dia';
    } else if (currentHour >= 12 && currentHour < 18) {
        return 'Boa tarde';
    } else {
        return 'Boa noite';
    }
};

const ChatApp = () => {
    const logoUrl = "https://edrrnawrhfhoynpiwqsc.supabase.co/storage/v1/object/sign/imagenscientes/fecomercio.aracaju/Sincomactintas.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80Y2RiMjE3Ni0xMzVkLTQ2ZTItYjJjYi0zMDlhMTNlNzQxNWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZW5zY2llbnRlcy9mZWNvbWVyY2lvLmFyYWNhanUvU2luY29tYWN0aW50YXMuanBnIiwiaWF0IjoxNzUzNTY3OTQzLCJleHAiOjIxMzE5OTk5NDN9.1rO-QYs-7b8Uh3oHJ0vKgGgNY3PClsnhDnNRJPaZPBk";
    
    const [theme, setTheme] = useState(localStorage.getItem('chatTheme') || 'dark');
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: `${getGreeting()}! Tudo bem?`, sender: 'bot' },
        { id: 2, text: 'Para continuarmos, selecione uma das opções abaixo 👇', sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [conversationStep, setConversationStep] = useState('awaiting_option');
    const [userInfo, setUserInfo] = useState({ name: '', phone: '', selectedOption: '' });
    const [isTyping, setIsTyping] = useState(false);
    const [isProcessingWebhook, setIsProcessingWebhook] = useState(false);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const showMainMenu = conversationStep === 'awaiting_option';
    const showAssociadoMenu = conversationStep === 'associado_menu';
    const showServicosMenu = conversationStep === 'servicos_menu';

    const systemInstruction = "Assuma a persona de 'Sincomactintas', um consultor especialista SÊNIOR, focado exclusivamente na Convenção Coletiva de Trabalho (CCT) de 2025. Sua identidade é de um humano experiente, prestativo e conhecedor, NUNCA de uma IA, robô ou programa. Comunique-se de forma profissional, mas calorosa e empática. Seu conhecimento é estritamente limitado à CCT 2025 e aos serviços disponíveis que lhe foram informados. Se perguntado sobre QUALQUER outro tópico, recuse educadamente, explicando que sua especialidade é a CCT 2025 e os serviços do sindicato. Se você não tiver 100% de certeza sobre uma resposta relacionada à CCT, SEJA HONESTO. Diga que precisa verificar com a equipe jurídica. Durante a conversa, você pode precisar coletar dados do usuário (nome, telefone). Use o schema JSON fornecido para analisar a resposta do usuário de forma inteligente. Se o usuário fizer uma pergunta em vez de fornecer o dado solicitado, sua prioriedade é RESPONDER A PERGUNTA. Após responder, peça novamente o dado que você precisa na mesma mensagem. Seja flexível e adapte-se ao usuário.";

    useEffect(() => {
        try {
            // ATENÇÃO: Chave de API exposta! Apenas para testes locais e privados.
            // NUNCA suba este código para um ambiente público com a chave aqui.
            const genAI = new GoogleGenAI({ apiKey: "AIzaSyALhfUW6htJTBLE7HJw1jmWPQNhJZ_Y_WA" });
            setAi(genAI);
            const chatSession = genAI.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
            setChat(chatSession);
        } catch (error) {
            console.error("Erro ao inicializar a IA:", error);
            addMessage("Desculpe, estou com um problema para me conectar. Verifique se a chave de API é válida.", 'bot');
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('chatTheme', theme);
    }, [theme]);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isProcessingWebhook]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };
    
    const addMessage = (text: string, sender: 'user' | 'bot', action: { type: string } | null = null) => {
        const newMessage: Message = { id: Date.now() + Math.random(), text, sender, action };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleDownloadPdf = () => {
        const pdfUrl = 'https://drive.google.com/uc?export=download&id=1fyAKInjQQAlu_2LwIhidDrEAywcg3zVy';
        try {
            window.open(pdfUrl, '_blank');
        } catch (error) {
            console.error("Erro ao tentar abrir o PDF:", error);
            addMessage("Desculpe, não consegui abrir o link do PDF. Por favor, entre em contato com o suporte.", 'bot');
        }
    };

    const handleToolboxRedirect = () => {
        const toolboxUrl = 'https://webhook.triad3.io/webhook/toolboxtriad3';
        try {
            window.open(toolboxUrl, '_blank');
        } catch (error) {
            console.error("Erro ao tentar abrir o link da ToolBox:", error);
            addMessage("Desculpe, não consegui abrir o link da ToolBox. Por favor, entre em contato com o suporte.", 'bot');
        }
    };

    const handleBackToMenu = () => {
        addMessage("Ok, retornamos ao menu principal.", 'bot');
        addMessage('Para continuarmos, selecione uma das opções abaixo 👇', 'bot');
        setConversationStep('awaiting_option');
        setUserInfo({ name: '', phone: '', selectedOption: '' });
    };

    const registerAndPrepareDownload = async (name: string, phone: string) => {
        setIsProcessingWebhook(true);
        try {
            const response = await fetch('https://webhook.prospectai.chat/webhook/infotell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone }),
            });
            const data = await response.json();
            if (response.ok && data.resposta === "Dados recebidos com sucesso!") {
                addMessage("Pronto! Seus dados foram registrados. Clique no botão abaixo para fazer o download da CCT 2025.", 'bot', { type: 'DOWNLOAD_PDF' });
                setConversationStep('flow_complete');
            } else {
                throw new Error(data.resposta || 'Resposta inesperada do servidor.');
            }
        } catch (error) {
            console.error("Erro no webhook:", error);
            addMessage("Tive um problema ao registrar seus dados. Por favor, tente novamente ou entre em contato com o suporte. Enquanto isso, como posso te ajudar?", 'bot');
            setConversationStep('general_chat');
        } finally {
            setIsProcessingWebhook(false);
        }
    };
    
    const registerDoubtsLead = async (name: string, phone: string) => {
        setIsProcessingWebhook(true);
        try {
            const response = await fetch('https://webhook.prospectai.chat/webhook/duvidasss', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone }),
            });
            const data = await response.json();
             if (response.ok && data.resposta === "Dados recebidos com sucesso!") {
                addMessage("Obrigado! Um de nossos especialistas entrará em contato com você pelo WhatsApp em breve para esclarecer suas dúvidas.", 'bot', { type: 'SHOW_BACK_BUTTON' });
                setConversationStep('flow_complete');
            } else {
                throw new Error(data.resposta || 'Resposta inesperada do servidor.');
            }
        } catch (error) {
            console.error("Erro no webhook de dúvidas:", error);
            addMessage("Tive um problema ao registrar sua solicitação. Por favor, tente novamente mais tarde.", 'bot', { type: 'SHOW_BACK_BUTTON' });
            setConversationStep('flow_complete');
        } finally {
            setIsProcessingWebhook(false);
        }
    };

    const processAndRespond = async (userInput: string) => {
        if (!ai || !chat) {
            addMessage("Desculpe, a IA não está pronta. Por favor, recarregue a página.", 'bot');
            return;
        }
        
        setIsTyping(true);

        if (conversationStep === 'general_chat') {
            try {
                const response = await chat.sendMessage({ message: userInput });
                addMessage(response.text, 'bot');
            } catch (error) {
                console.error("Erro no chat geral:", error);
                addMessage("Tive um probleminha para processar sua mensagem. Podemos tentar de novo?", 'bot');
            } finally {
                setIsTyping(false);
            }
            return;
        }

        let contextPrompt = '';
        let schema;

        if (conversationStep === 'awaiting_name') {
            contextPrompt = `Minha última mensagem foi pedindo o nome completo do usuário. A resposta dele foi: '${userInput}'. Analise esta resposta.`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    is_question: { type: Type.BOOLEAN, description: "A resposta do usuário é uma pergunta em vez do nome?" },
                    response_text: { type: Type.STRING, description: "Texto de resposta para o usuário. Se for uma pergunta, responda-a primeiro e DEPOIS peça o nome novamente. Se for um nome, apenas agradeça e peça o telefone." },
                    user_name: { type: Type.STRING, description: "O nome completo do usuário, se identificado. Caso contrário, null." }
                },
                required: ['is_question', 'response_text']
            };
        } else if (conversationStep === 'awaiting_phone') {
            contextPrompt = `Já coletei o nome do usuário (${userInfo.name}). Minha última mensagem foi pedindo o telefone. A resposta do usuário foi: '${userInput}'. Analise esta resposta.`;
             schema = {
                type: Type.OBJECT,
                properties: {
                    is_question: { type: Type.BOOLEAN, description: "A resposta do usuário é uma pergunta em vez do telefone?" },
                    response_text: { type: Type.STRING, description: "Texto de resposta para o usuário. Se for uma pergunta, responda-a primeiro e DEPOIS peça o telefone novamente. Se for um telefone válido, confirme e prossiga." },
                    user_phone: { type: Type.STRING, description: "O telefone do usuário, se identificado. Caso contrário, null." }
                },
                required: ['is_question', 'response_text']
            };
        }

        try {
            const response = await ai.models.generateContent({
               model: "gemini-2.5-flash",
               contents: contextPrompt,
               config: {
                 systemInstruction: systemInstruction,
                 responseMimeType: "application/json",
                 responseSchema: schema,
               },
            });
            
            const jsonText = response.text.trim();
            const parsedResponse = JSON.parse(jsonText);

            // Handle successful phone collection AND EXIT. No intermediate message.
            if (conversationStep === 'awaiting_phone' && parsedResponse.user_phone) {
                const updatedUserInfo = { ...userInfo, phone: parsedResponse.user_phone };
                setUserInfo(updatedUserInfo);
                setIsTyping(false); // Stop typing indicator, webhook processing starts next

                if (updatedUserInfo.selectedOption === 'DOWNLOAD CCT 2025') {
                    await registerAndPrepareDownload(updatedUserInfo.name, updatedUserInfo.phone);
                } else if (updatedUserInfo.selectedOption === 'TIRAR DÚVIDAS CCT 2025') {
                    await registerDoubtsLead(updatedUserInfo.name, updatedUserInfo.phone);
                }
                return; // Exit function to prevent adding more messages
            }
            
            // For all other cases (name collection, or questions), add the AI's response message.
            addMessage(parsedResponse.response_text, 'bot');

            if (conversationStep === 'awaiting_name' && parsedResponse.user_name) {
                setUserInfo(prev => ({ ...prev, name: parsedResponse.user_name }));
                setConversationStep('awaiting_phone');
            }
        } catch(error) {
            console.error("Erro na análise da IA:", error);
            addMessage("Opa, tive uma pequena dificuldade para entender. Poderia tentar de outra forma?", 'bot');
        } finally {
            setIsTyping(false);
        }
    };

    const handleSendMessage = () => {
        if (inputValue.trim() === '' || isTyping || isProcessingWebhook) return;
        const currentInput = inputValue;
        addMessage(currentInput, 'user');
        setInputValue('');
        processAndRespond(currentInput);
    };

    const handleOptionClick = (optionText: string) => {
        addMessage(optionText, 'user');
        setUserInfo(prev => ({ ...prev, selectedOption: optionText }));
        
        if (optionText === 'DOWNLOAD CCT 2025') {
            setConversationStep('awaiting_name');
            setTimeout(() => {
                addMessage('Legal! Para prosseguirmos com o download, por favor, digite seu nome completo.', 'bot');
            }, 1000);
        } else if (optionText === 'TIRAR DÚVIDAS CCT 2025') {
            setConversationStep('awaiting_name');
            setTimeout(() => {
                addMessage('Entendido. Para que um de nossos especialistas possa te ajudar, por favor, me informe seu nome completo.', 'bot');
            }, 1000);
        } else { // CENTRAL DO ASSOCIADO
            setTimeout(() => {
                addMessage(`Entendido. Você está na Central do Associado. O que você gostaria de ver?`, 'bot');
                // Adicionado um pequeno atraso para garantir que a mensagem renderize antes dos botões
                setTimeout(() => setConversationStep('associado_menu'), 50);
            }, 1000);
        }
    };

    const handleAssociadoOptionClick = (optionText: string) => {
        addMessage(optionText, 'user');

        if (optionText === 'FERRAMENTAS DIGITAIS (PARCERIA)') {
            setConversationStep('general_chat');
            setTimeout(() => {
                addMessage(
                    'ToolBox Triad3 é um conjunto de ferramentas criado para oferecer o que há de mais avançado em tecnologia para você e sua equipe.', 
                    'bot',
                    { type: 'SHOW_TOOLBOX_BUTTONS' }
                );
            }, 1000);
        } else { // SERVIÇOS DIPONÍVEIS
            setTimeout(() => {
                addMessage(
                    'Perfeito! Estes são os nossos serviços disponíveis. Selecione uma opção para saber mais detalhes:',
                    'bot'
                );
                 // Adicionado um pequeno atraso para garantir que a mensagem renderize antes dos botões
                setTimeout(() => setConversationStep('servicos_menu'), 50);
            }, 1000);
        }
    };

    const servicosDetails = {
        'Convenção Coletiva': 'Disponibiliza a Convenção Coletiva de Trabalho 2025, disponível oficialmente para download desde 14 de julho de 2025 no site da Fecomércio-SE.\nA convenção define direitos trabalhistas, pisos salariais, benefícios, jornada e regulamentos do setor, com reajustes e cláusulas específicas negociadas entre patrões e empregados. Foi destacada a falta de propostas patronais em 2025, mesmo após negociação intensa com trabalhadores.',
        'Representação Sindical': 'Representa legalmente empresas do setor patronal (varejo de tintas, materiais para pintura, produtos químicos correlatos) junto à Fecomércio-SE, órgãos públicos e sindicatos de trabalhadores.',
        'Eventos e Capacitação': 'Em parceria com o SESCAP‑SE, promove palestras e treinamentos, como o evento “Benefícios do Regime Atacadista para o Setor de Material de Construção” ocorrido em 15 de agosto de 2024, voltado à educação tributária e operacional.',
        'Orientação Sindical': 'Oferece orientação sobre contribuições sindicais, convenções e legislação trabalhista, por meio de apoio indireto via Fecomércio-SE e parceiros do sistema sindical.'
    };

    const handleServicosOptionClick = (optionText: keyof typeof servicosDetails) => {
        addMessage(optionText, 'user');
        setConversationStep('general_chat');
        
        const detailText = servicosDetails[optionText];
        const actionType = 'SHOW_BACK_BUTTON';

        setTimeout(() => {
            addMessage(
                detailText, 
                'bot',
                { type: actionType }
            );
        }, 1000);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !showMainMenu && !showAssociadoMenu && !showServicosMenu && !isTyping && !isProcessingWebhook) {
            handleSendMessage();
        }
    };

    const getPlaceholder = () => {
        if (showMainMenu || showAssociadoMenu || showServicosMenu) return 'Selecione uma das opções para continuar';
        if (isTyping) return 'Digitando...';
        if (isProcessingWebhook) return 'Processando sua solicitação...';
        if (conversationStep === 'awaiting_name') return 'Digite seu nome completo...';
        if (conversationStep === 'awaiting_phone') return 'Digite seu telefone com DDD...';
        if (conversationStep === 'flow_complete') return 'Ação necessária para continuar...';
        return 'Digite sua mensagem...';
    };

    const mainOptions = ['DOWNLOAD CCT 2025', 'TIRAR DÚVIDAS CCT 2025', 'CENTRAL DO ASSOCIADO'];
    const associadoOptions = ['SERVIÇOS DIPONÍVEIS', 'FERRAMENTAS DIGITAIS (PARCERIA)'];
    const servicosOptions: (keyof typeof servicosDetails)[] = ['Convenção Coletiva', 'Representação Sindical', 'Eventos e Capacitação', 'Orientação Sindical'];

    return (
        <div className="flex flex-col h-full w-full bg-transparent">
            <header className="flex items-center p-4 bg-transparent shrink-0">
                <div className="flex items-center flex-1">
                    <img src={logoUrl} alt="Logo de Perfil" className="w-12 h-12 rounded-full border-2 border-white/20 object-cover shadow-lg"/>
                    <div className="ml-4">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Sincomactintas</h1>
                        <div className="flex items-center">
                            <span className="h-2.5 w-2.5 bg-green-400 rounded-full mr-1.5 border-2 border-white/50 dark:border-gray-800/50"></span>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Online</p>
                        </div>
                    </div>
                </div>
                <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none text-2xl w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors" aria-label="Alternar modo claro/escuro">
                    {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
                </button>
            </header>

            <main className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-3 message-animation ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                           {msg.sender === 'bot' && <img src={logoUrl} alt="Bot avatar" className="w-9 h-9 rounded-full self-start object-cover shadow-md"/>}
                           <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md transition-all duration-300 ${msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                               <p className="text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                               {msg.action?.type === 'DOWNLOAD_PDF' && (
                                   <div className="mt-4 space-y-2">
                                    <button onClick={handleDownloadPdf} className="w-full p-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-lg hover:shadow-green-500/40 flex items-center justify-center transform hover:-translate-y-0.5">
                                       <i className="fas fa-download mr-2"></i> BAIXAR CCT 2025
                                    </button>
                                    <button onClick={handleBackToMenu} className="w-full p-3 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 transition-all shadow-lg hover:shadow-gray-500/40 flex items-center justify-center transform hover:-translate-y-0.5">
                                       <i className="fas fa-undo mr-2"></i> VOLTAR AO MENU
                                    </button>
                                   </div>
                               )}
                               {msg.action?.type === 'SHOW_BACK_BUTTON' && (
                                    <button onClick={handleBackToMenu} className="mt-4 w-full p-3 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 transition-all shadow-lg hover:shadow-gray-500/40 flex items-center justify-center transform hover:-translate-y-0.5">
                                       <i className="fas fa-undo mr-2"></i> VOLTAR AO MENU
                                    </button>
                               )}
                               {msg.action?.type === 'SHOW_TOOLBOX_BUTTONS' && (
                                   <div className="mt-4 space-y-2">
                                    <button onClick={handleToolboxRedirect} className="w-full p-3 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/40 flex items-center justify-center transform hover:-translate-y-0.5">
                                       <i className="fas fa-tools mr-2"></i> TOOLBOX TRIAD3
                                    </button>
                                    <button onClick={handleBackToMenu} className="w-full p-3 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 transition-all shadow-lg hover:shadow-gray-500/40 flex items-center justify-center transform hover:-translate-y-0.5">
                                       <i className="fas fa-undo mr-2"></i> VOLTAR AO MENU
                                    </button>
                                   </div>
                               )}
                           </div>
                        </div>
                    ))}
                </div>
                 {showMainMenu && (
                    <div className="flex flex-col items-start space-y-2 mt-4 ml-12 message-animation">
                        {mainOptions.map((option) => (
                             <button key={option} onClick={() => handleOptionClick(option)} className="w-full max-w-sm p-3 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-black/5 dark:border-white/5 text-gray-700 dark:text-gray-200 font-semibold hover:bg-white dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-left">
                                {option}
                            </button>
                        ))}
                    </div>
                )}
                {showAssociadoMenu && (
                    <div className="flex flex-col items-start space-y-2 mt-4 ml-12 message-animation">
                        {associadoOptions.map((option) => (
                             <button key={option} onClick={() => handleAssociadoOptionClick(option)} className="w-full max-w-sm p-3 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-black/5 dark:border-white/5 text-gray-700 dark:text-gray-200 font-semibold hover:bg-white dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-left">
                                {option}
                            </button>
                        ))}
                    </div>
                )}
                {showServicosMenu && (
                    <div className="flex flex-col items-start space-y-2 mt-4 ml-12 message-animation">
                        {servicosOptions.map((option) => (
                             <button key={option} onClick={() => handleServicosOptionClick(option)} className="w-full max-w-sm p-3 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-black/5 dark:border-white/5 text-gray-700 dark:text-gray-200 font-semibold hover:bg-white dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-left">
                                {option}
                            </button>
                        ))}
                    </div>
                )}
                {isTyping && (
                    <div className="flex items-end gap-3 justify-start message-animation mt-6">
                        <img src={logoUrl} alt="Bot avatar" className="w-9 h-9 rounded-full self-start object-cover"/>
                        <div className="px-4 py-4 rounded-2xl shadow-md bg-white dark:bg-gray-700 rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <span className="typing-dot"></span>
                                <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
                                <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 bg-transparent shrink-0">
                <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-2xl shadow-inner-lg border border-black/5 dark:border-white/5">
                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={getPlaceholder()} className="flex-1 p-3 rounded-xl bg-transparent focus:outline-none dark:text-white transition-all disabled:opacity-50" aria-label="Campo de entrada de mensagem" disabled={showMainMenu || showAssociadoMenu || showServicosMenu || isTyping || isProcessingWebhook || conversationStep === 'flow_complete'} />
                    <button onClick={handleSendMessage} className="bg-blue-500 text-white rounded-xl w-12 h-12 flex items-center justify-center hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all transform hover:scale-105 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-gray-400" aria-label="Enviar mensagem" disabled={showMainMenu || showAssociadoMenu || showServicosMenu || isTyping || isProcessingWebhook || inputValue.trim() === '' || conversationStep === 'flow_complete'}>
                        <i className="fas fa-paper-plane text-lg"></i>
                    </button>
                </div>
            </footer>
        </div>
    );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!);
root.render(<ChatApp />);