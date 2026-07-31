window.SvgData = {
    leftDeco: `<svg class="card-deco" viewBox="0 0 360 560" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- Top-left: Friendly ghost (watercolor style) -->
        <g transform="translate(12, 8) scale(0.72)" opacity="0.55">
            <g class="animated-ghost">
                <ellipse cx="40" cy="30" rx="22" ry="25" fill="#e8d5f5" filter="url(#blur1)" />
                <path d="M18 30 Q16 55 18 68 Q22 75 26 70 Q30 65 34 70 Q38 75 42 70 Q46 65 50 70 Q54 75 58 70 Q60 62 62 50 Q62 35 40 10 Z" fill="#d9c4ef" opacity="0.85" />
                <ellipse cx="33" cy="32" rx="4" ry="5" class="ghost-eye" fill="#7b4fa6" opacity="0.7" />
                <ellipse cx="47" cy="32" rx="4" ry="5" class="ghost-eye" fill="#7b4fa6" opacity="0.7" />
                <path d="M34 42 Q40 47 46 42" stroke="#7b4fa6" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6" />
                <ellipse cx="28" cy="39" rx="5" ry="3" fill="#f9a8d4" opacity="0.4" />
                <ellipse cx="52" cy="39" rx="5" ry="3" fill="#f9a8d4" opacity="0.4" />
            </g>
        </g>
        <!-- Top-right: Witch hat -->
        <g transform="translate(270, -2) scale(0.65)" opacity="0.50">
            <g class="animated-hat">
                <ellipse cx="50" cy="72" rx="40" ry="8" fill="#3b1d5c" opacity="0.7" />
                <path d="M20 72 Q28 40 50 4 Q72 40 80 72 Z" fill="#3b1d5c" opacity="0.75" />
                <rect x="22" y="62" width="56" height="9" rx="3" fill="#ff7a00" opacity="0.8" />
                <rect x="43" y="63" width="14" height="7" rx="2" fill="#f6c90e" opacity="0.8" />
                <ellipse cx="50" cy="30" rx="18" ry="20" fill="#6a2fa0" opacity="0.15" filter="url(#blur1)" />
            </g>
        </g>
        <!-- Autumn leaves -->
        <g transform="translate(305, 40) rotate(30) scale(0.45)" opacity="0.50">
            <path d="M20 0 Q35 8 30 25 Q20 32 10 25 Q5 8 20 0 Z" fill="#e05c10" />
            <path d="M20 0 L20 30" stroke="#c04a08" stroke-width="1.5" fill="none" opacity="0.7" />
        </g>
        <g transform="translate(325, 120) rotate(-20) scale(0.40)" opacity="0.45">
            <path d="M20 0 Q38 10 32 28 Q20 35 8 28 Q2 10 20 0 Z" fill="#cc7010" />
            <path d="M20 0 L20 32" stroke="#a05808" stroke-width="1.5" fill="none" opacity="0.6" />
        </g>
        <g transform="translate(320, 460) rotate(55) scale(0.42)" opacity="0.45">
            <path d="M20 0 Q36 10 30 27 Q20 34 10 27 Q4 10 20 0 Z" fill="#d86010" />
            <path d="M20 0 L20 30" stroke="#b04808" stroke-width="1.5" fill="none" opacity="0.55" />
        </g>
        <g transform="translate(10, 260) rotate(-40) scale(0.38)" opacity="0.40">
            <path d="M20 0 Q36 10 30 27 Q20 34 10 27 Q4 10 20 0 Z" fill="#e07015" />
            <path d="M20 0 L20 30" stroke="#b85510" stroke-width="1.5" fill="none" opacity="0.55" />
        </g>
        <!-- Branch -->
        <g opacity="0.10">
            <path d="M340 560 Q320 490 310 440 Q300 400 330 370" stroke="#5a3010" stroke-width="4" fill="none" stroke-linecap="round" />
            <path d="M310 440 Q280 420 265 400" stroke="#5a3010" stroke-width="2.5" fill="none" stroke-linecap="round" />
            <path d="M320 480 Q290 470 278 455" stroke="#5a3010" stroke-width="2" fill="none" stroke-linecap="round" />
        </g>
        <defs>
            <filter id="blur1">
                <feGaussianBlur stdDeviation="3" />
            </filter>
        </defs>
    </svg>`,

    rightDeco: `<svg class="card-deco" viewBox="0 0 360 560" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- Top-right: Spiderweb -->
        <g transform="translate(260, -10) scale(0.75)" opacity="0.45">
            <g stroke="#5a3a1a" stroke-width="1.2" fill="none" opacity="0.9">
                <line x1="60" y1="60" x2="60" y2="10" />
                <line x1="60" y1="60" x2="100" y2="20" />
                <line x1="60" y1="60" x2="110" y2="60" />
                <line x1="60" y1="60" x2="100" y2="100" />
                <line x1="60" y1="60" x2="60" y2="110" />
                <line x1="60" y1="60" x2="20" y2="100" />
                <line x1="60" y1="60" x2="10" y2="60" />
                <line x1="60" y1="60" x2="20" y2="20" />
            </g>
            <g stroke="#5a3a1a" stroke-width="0.9" fill="none" opacity="0.75">
                <path d="M60 25 Q80 30 87 50 Q90 70 80 87 Q65 95 48 87 Q30 80 28 60 Q28 40 45 28 Q52 24 60 25" />
                <path d="M60 42 Q72 45 77 58 Q78 70 70 78 Q62 83 52 78 Q43 72 42 60 Q42 47 52 43 Q56 41 60 42" />
            </g>
        </g>
        <!-- Top-left: Bat silhouette -->
        <g transform="translate(10, 22) scale(0.55)" opacity="0.45">
            <ellipse cx="50" cy="25" rx="30" ry="12" fill="#3b1d5c" filter="url(#blur2)" opacity="0.4" />
            <path d="M50 20 Q35 5 15 15 Q28 22 32 30 Q40 38 50 35 Q60 38 68 30 Q72 22 85 15 Q65 5 50 20 Z" fill="#2a1040" />
            <ellipse cx="50" cy="30" rx="8" ry="10" fill="#2a1040" />
            <path d="M44 22 L42 15 L48 20 Z" fill="#2a1040" />
            <path d="M56 22 L58 15 L52 20 Z" fill="#2a1040" />
        </g>
        <!-- Second bat -->
        <g transform="translate(300, 80) scale(0.38)" opacity="0.38">
            <path d="M50 20 Q35 5 15 15 Q28 22 32 30 Q40 38 50 35 Q60 38 68 30 Q72 22 85 15 Q65 5 50 20 Z" fill="#2a1040" />
            <ellipse cx="50" cy="30" rx="8" ry="10" fill="#2a1040" />
        <!-- Autumn leaves -->
        <g transform="translate(340, 200) rotate(-35) scale(0.44)" opacity="0.48">
            <path d="M20 0 Q38 10 32 28 Q20 35 8 28 Q2 10 20 0 Z" fill="#d06010" />
            <path d="M20 0 L20 32" stroke="#a04808" stroke-width="1.5" fill="none" opacity="0.6" />
        </g>
        <g transform="translate(10, 340) rotate(60) scale(0.40)" opacity="0.42">
            <path d="M20 0 Q36 10 30 27 Q20 34 10 27 Q4 10 20 0 Z" fill="#e07015" />
            <path d="M20 0 L20 30" stroke="#b85510" stroke-width="1.5" fill="none" opacity="0.55" />
        </g>
        <g transform="translate(345, 380) rotate(15) scale(0.38)" opacity="0.40">
            <path d="M20 0 Q36 10 30 27 Q20 34 10 27 Q4 10 20 0 Z" fill="#c85808" />
        </g>
        <!-- Branch -->
        <g opacity="0.30">
            <path d="M0 0 Q30 60 20 120 Q15 160 35 190" stroke="#5a3010" stroke-width="4.5" fill="none" stroke-linecap="round" />
            <path d="M20 120 Q55 105 70 90" stroke="#5a3010" stroke-width="2.5" fill="none" stroke-linecap="round" />
            <path d="M28 155 Q60 145 72 132" stroke="#5a3010" stroke-width="2" fill="none" stroke-linecap="round" />
            <path d="M35 190 Q60 200 68 215" stroke="#5a3010" stroke-width="1.8" fill="none" stroke-linecap="round" />
        </g>
        <defs>
            <filter id="blur2">
                <feGaussianBlur stdDeviation="4" />
            </filter>
        </defs>
    </svg>`
};
