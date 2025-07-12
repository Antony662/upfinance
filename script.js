// Inicialização das animações AOS
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        once: true,
        offset: 50,
        easing: 'ease-out-cubic'
    });
});

// Header transparente/opaco baseado no scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Menu mobile toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// CSS para o menu mobile ativo
const mobileMenuStyles = `
    @media (max-width: 768px) {
        .nav-links.active {
            display: flex;
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            z-index: 999;
        }
        
        .nav-links.active a {
            padding: 1rem 0;
            border-bottom: 1px solid #eee;
        }
        
        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;

// Adicionar estilos do menu mobile
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileMenuStyles;
document.head.appendChild(styleSheet);

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', function() {
        const isActive = item.classList.contains('active');
        
        // Fechar todos os outros itens
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle do item atual
        if (isActive) {
            item.classList.remove('active');
        } else {
            item.classList.add('active');
        }
    });
});

// Smooth scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Contador animado para estatísticas
function animateCounter(element, target, duration) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            if (target >= 1000) {
                element.textContent = Math.floor(current / 1000) + 'k+';
            } else {
                element.textContent = current.toFixed(1);
            }
        }
    }, 16);
}

// Inicializar contadores quando a seção hero for visível
const heroSection = document.querySelector('.hero');
const statNumbers = document.querySelectorAll('.stat-number');
let countersAnimated = false;

const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
            countersAnimated = true;
            
            statNumbers.forEach((statElement, index) => {
                const originalText = statElement.textContent;
                let targetValue;
                
                if (originalText.includes('k+')) {
                    targetValue = parseInt(originalText.replace('k+', '')) * 1000;
                } else if (originalText.includes('.')) {
                    targetValue = parseFloat(originalText);
                } else {
                    targetValue = parseInt(originalText);
                }
                
                animateCounter(statElement, targetValue, 2000);
            });
        }
    });
}, observerOptions);

if (heroSection) {
    heroObserver.observe(heroSection);
}

// Animação de digitação para o mockup do WhatsApp
function typeMessage(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function typeChar() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeChar, speed);
        }
    }
    
    typeChar();
}

// Animação das mensagens do WhatsApp
function animateWhatsAppMessages() {
    const messages = document.querySelectorAll('.message');
    
    messages.forEach((message, index) => {
        setTimeout(() => {
            message.style.animation = 'messageSlide 0.5s ease-out forwards';
            message.style.opacity = '1';
        }, index * 1000);
    });
}

// Inicializar animações quando a seção hero for visível
const whatsappMockup = document.querySelector('.whatsapp-mockup');
let whatsappAnimated = false;

const whatsappObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !whatsappAnimated) {
            whatsappAnimated = true;
            setTimeout(() => {
                animateWhatsAppMessages();
            }, 500);
        }
    });
}, { threshold: 0.3 });

if (whatsappMockup) {
    whatsappObserver.observe(whatsappMockup);
}

// Parallax effect para o hero
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Hover effects para cards
const cards = document.querySelectorAll('.benefit-card, .pricing-card, .testimonial-card');

cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Loading screen (opcional)
window.addEventListener('load', function() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
});

// Scroll to top button
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '↑';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00b894, #0984e3);
    color: white;
    border: none;
    font-size: 20px;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 5px 15px rgba(0, 184, 148, 0.3);
`;

document.body.appendChild(scrollToTopBtn);

scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Mostrar/ocultar botão de scroll to top
window.addEventListener('scroll', function() {
    if (window.scrollY > 500) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.visibility = 'visible';
    } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.visibility = 'hidden';
    }
});

// Animação de "breathing" para elementos importantes
const breathingElements = document.querySelectorAll('.btn-primary, .cta-button');

breathingElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.animation = 'none';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.animation = 'pulse 2s infinite';
    });
});

// Preloader para imagens
const images = document.querySelectorAll('img');
let imagesLoaded = 0;

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === images.length) {
        document.body.classList.add('images-loaded');
    }
}

images.forEach(img => {
    if (img.complete) {
        imageLoaded();
    } else {
        img.addEventListener('load', imageLoaded);
        img.addEventListener('error', imageLoaded);
    }
});

// Tooltips para elementos informativos
const tooltipElements = document.querySelectorAll('[data-tooltip]');

tooltipElements.forEach(element => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = element.getAttribute('data-tooltip');
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        white-space: nowrap;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    element.addEventListener('mouseenter', function(e) {
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
    });
    
    element.addEventListener('mouseleave', function() {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
    });
});

// Animação de progress bar para seções
const progressBars = document.querySelectorAll('.progress-bar');

const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
        }
    });
}, { threshold: 0.5 });

progressBars.forEach(bar => {
    progressObserver.observe(bar);
});

// Form validation (se houver formulários)
const forms = document.querySelectorAll('form');

forms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let valid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                valid = false;
                input.style.borderColor = '#e74c3c';
                input.style.animation = 'shake 0.5s ease-in-out';
            } else {
                input.style.borderColor = '#00b894';
            }
        });
        
        if (valid) {
            // Aqui você pode adicionar a lógica de envio do formulário
            console.log('Formulário válido - pronto para envio');
        }
    });
});

// Shake animation para campos inválidos
const shakeKeyframes = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;

const shakeStyle = document.createElement('style');
shakeStyle.textContent = shakeKeyframes;
document.head.appendChild(shakeStyle);

// Console log para debugging
console.log('🚀 Up Money Landing Page - JavaScript carregado com sucesso!');
console.log('✅ Animações AOS inicializadas');
console.log('✅ FAQ interativo ativado');
console.log('✅ Menu mobile configurado');
console.log('✅ Scroll suave ativado');
console.log('✅ Contadores animados prontos');
console.log('💰 Up Money - Sua solução financeira inteligente!');