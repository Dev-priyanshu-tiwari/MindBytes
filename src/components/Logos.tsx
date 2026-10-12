import React from 'react';

export const KnowviaLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 110,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="KNOWVIA CSE Quiz Club Logo"
    >
      <defs>
        {/* Outer Gold Metallic Gradients */}
        <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff2be" />
          <stop offset="20%" stopColor="#e8b84a" />
          <stop offset="45%" stopColor="#8d6415" />
          <stop offset="55%" stopColor="#ffd875" />
          <stop offset="80%" stopColor="#cf9a2d" />
          <stop offset="100%" stopColor="#ffe699" />
        </linearGradient>

        <radialGradient id="innerRimGlow" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#080e21" />
          <stop offset="97%" stopColor="#1a274c" />
          <stop offset="100%" stopColor="#ffd875" />
        </radialGradient>

        {/* Central Cosmic Nebula Gradient */}
        <radialGradient id="nebulaBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#192a56" />
          <stop offset="35%" stopColor="#151a3d" />
          <stop offset="65%" stopColor="#0a0f26" />
          <stop offset="100%" stopColor="#030612" />
        </radialGradient>

        <linearGradient id="cyanPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3de8ff" />
          <stop offset="40%" stopColor="#00b4ff" />
          <stop offset="75%" stopColor="#b55fe6" />
          <stop offset="100%" stopColor="#ff57b2" />
        </linearGradient>

        <linearGradient id="treeGrad" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#00b4ff" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ff57b2" />
        </linearGradient>

        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Text Arcs */}
        {/* Top Arc for KNOWVIA: radius 195, from left to right */}
        <path
          id="knowviaArc"
          d="M 68 250 A 182 182 0 0 1 432 250"
          fill="none"
        />
        {/* Bottom Arc for QUIZ CLUB: radius 188, counter-clockwise so text sits upright facing center */}
        <path
          id="quizClubArc"
          d="M 105 285 A 182 182 0 0 0 395 285"
          fill="none"
        />
      </defs>

      {/* 1. Outermost Gold Beveled Border */}
      <circle cx="250" cy="250" r="242" fill="url(#goldRim)" />
      <circle cx="250" cy="250" r="236" fill="#080e21" stroke="url(#goldRim)" strokeWidth="2" />

      {/* 2. Outer Black Beveled Text Ring */}
      <circle cx="250" cy="250" r="234" fill="url(#innerRimGlow)" />
      
      {/* Subtle Radial Text Ring Texture Lines */}
      <circle cx="250" cy="250" r="230" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx="250" cy="250" r="150" stroke="url(#goldRim)" strokeWidth="4" />
      <circle cx="250" cy="250" r="144" stroke="#3de8ff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.75" />

      {/* 3. Text in Ring */}
      {/* KNOWVIA (Top Arch) */}
      <text
        fill="#ffffff"
        fontFamily="'Poppins', 'Montserrat', sans-serif"
        fontSize="50"
        fontWeight="800"
        letterSpacing="0.22em"
        filter="url(#textGlow)"
      >
        <textPath href="#knowviaArc" startOffset="50%" textAnchor="middle">
          KNOWVIA
        </textPath>
      </text>

      {/* QUIZ CLUB (Bottom Arch) */}
      <text
        fill="#ffffff"
        fontFamily="'Poppins', 'Montserrat', sans-serif"
        fontSize="34"
        fontWeight="700"
        letterSpacing="0.28em"
        filter="url(#textGlow)"
      >
        <textPath href="#quizClubArc" startOffset="50%" textAnchor="middle">
          QUIZ CLUB
        </textPath>
      </text>

      {/* 4. Center Medallion Inner Circle */}
      <circle cx="250" cy="250" r="140" fill="url(#nebulaBg)" />

      {/* Cyber Circuit Grid & Cosmic Dust within Medallion */}
      <g opacity="0.35">
        {/* Horizontal & vertical subtle circuit lines */}
        <line x1="120" y1="200" x2="380" y2="200" stroke="#00b4ff" strokeWidth="0.8" />
        <line x1="120" y1="250" x2="380" y2="250" stroke="#00b4ff" strokeWidth="0.8" />
        <line x1="120" y1="300" x2="380" y2="300" stroke="#00b4ff" strokeWidth="0.8" />
        <line x1="180" y1="120" x2="180" y2="380" stroke="#8b5cf6" strokeWidth="0.8" />
        <line x1="250" y1="120" x2="250" y2="380" stroke="#8b5cf6" strokeWidth="0.8" />
        <line x1="320" y1="120" x2="320" y2="380" stroke="#8b5cf6" strokeWidth="0.8" />

        {/* Binary / Hex tiny nodes */}
        <circle cx="150" cy="180" r="2" fill="#3de8ff" />
        <circle cx="350" cy="180" r="2" fill="#3de8ff" />
        <circle cx="160" cy="310" r="2" fill="#ff57b2" />
        <circle cx="340" cy="310" r="2" fill="#ff57b2" />
        <circle cx="190" cy="150" r="1.5" fill="#ffd875" />
        <circle cx="310" cy="150" r="1.5" fill="#ffd875" />
      </g>

      {/* 5. Circuit Tree Dendrites (sprouting upwards into purple/pink) */}
      <g stroke="url(#treeGrad)" strokeWidth="2.4" strokeLinecap="round" fill="none" filter="url(#softGlow)">
        {/* Main central trunk & branches behind brain */}
        <path d="M 250 200 L 250 145" />
        <path d="M 250 165 C 240 150 215 142 200 135" />
        <path d="M 250 165 C 260 150 285 142 300 135" />
        <path d="M 250 145 C 235 130 225 115 220 95" />
        <path d="M 250 145 C 265 130 275 115 280 95" />

        {/* Left spreading neural branches */}
        <path d="M 215 190 C 190 175 175 160 160 140" />
        <path d="M 185 165 C 165 155 150 140 140 120" />
        <path d="M 195 180 C 180 165 170 145 170 120" />
        <path d="M 160 140 C 150 135 145 125 142 110" />

        {/* Right spreading neural branches */}
        <path d="M 285 190 C 310 175 325 160 340 140" />
        <path d="M 315 165 C 335 155 350 140 360 120" />
        <path d="M 305 180 C 320 165 330 145 330 120" />
        <path d="M 340 140 C 350 135 355 125 358 110" />

        {/* Terminal branch circuit node dots */}
        <circle cx="220" cy="95" r="3" fill="#ff57b2" />
        <circle cx="280" cy="95" r="3" fill="#ff57b2" />
        <circle cx="200" cy="135" r="2.5" fill="#3de8ff" />
        <circle cx="300" cy="135" r="2.5" fill="#3de8ff" />
        <circle cx="140" cy="120" r="3" fill="#3de8ff" />
        <circle cx="360" cy="120" r="3" fill="#3de8ff" />
        <circle cx="170" cy="120" r="2.5" fill="#b55fe6" />
        <circle cx="330" cy="120" r="2.5" fill="#b55fe6" />
        <circle cx="142" cy="110" r="2" fill="#ff57b2" />
        <circle cx="358" cy="110" r="2" fill="#ff57b2" />
      </g>

      {/* Question mark symbols in branches */}
      <text x="175" y="200" fill="#ffd875" fontSize="16" fontFamily="'Poppins', sans-serif" fontWeight="800" opacity="0.85">?</text>
      <text x="315" y="200" fill="#ffd875" fontSize="16" fontFamily="'Poppins', sans-serif" fontWeight="800" opacity="0.85">?</text>

      {/* 6. Central AI Brain with Circuitry */}
      <g filter="url(#softGlow)">
        {/* Left Hemisphere Outline */}
        <path
          d="M 245 190 
             C 230 190 220 198 214 205 
             C 200 205 190 215 192 230 
             C 185 238 188 252 198 258 
             C 195 268 202 278 215 282 
             C 225 286 240 286 245 286 Z"
          fill="#060c22"
          stroke="#00b4ff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Hemisphere Outline */}
        <path
          d="M 255 190 
             C 270 190 280 198 286 205 
             C 300 205 310 215 308 230 
             C 315 238 312 252 302 258 
             C 305 268 298 278 285 282 
             C 275 286 260 286 255 286 Z"
          fill="#060c22"
          stroke="#00b4ff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Internal Brain Sulci / Neural folds */}
        {/* Left folds */}
        <path d="M 215 220 Q 230 215 240 225" stroke="#3de8ff" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M 205 242 Q 220 238 232 248" stroke="#3de8ff" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M 215 265 Q 230 262 242 270" stroke="#3de8ff" strokeWidth="2.8" strokeLinecap="round" fill="none" />

        {/* Right folds */}
        <path d="M 285 220 Q 270 215 260 225" stroke="#3de8ff" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M 295 242 Q 280 238 268 248" stroke="#3de8ff" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M 285 265 Q 270 262 258 270" stroke="#3de8ff" strokeWidth="2.8" strokeLinecap="round" fill="none" />

        {/* Central Triangle / Play Icon inside Brain Center */}
        <circle cx="250" cy="238" r="17" fill="#081436" stroke="#3de8ff" strokeWidth="3" />
        <polygon points="246,230 258,238 246,246" fill="#3de8ff" />
      </g>

      {/* 7. Open Book Beneath the Brain */}
      <g filter="url(#softGlow)">
        {/* Book spine line */}
        <line x1="250" y1="288" x2="250" y2="335" stroke="#3de8ff" strokeWidth="3.5" strokeLinecap="round" />

        {/* Outer Book Cover */}
        <path
          d="M 250 292
             C 215 282 175 285 145 292
             L 145 328
             C 175 320 215 318 250 332
             C 285 318 325 320 355 328
             L 355 292
             C 325 285 285 282 250 292 Z"
          fill="#060e28"
          stroke="#00b4ff"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Glowing Book Pages (Curved lines) */}
        {/* Left page layer 1 */}
        <path d="M 248 302 C 218 294 185 296 155 304" stroke="#3de8ff" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Left page layer 2 */}
        <path d="M 248 312 C 218 304 185 306 155 314" stroke="#3de8ff" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Left page layer 3 */}
        <path d="M 248 322 C 218 314 185 316 155 323" stroke="#3de8ff" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Right page layer 1 */}
        <path d="M 252 302 C 282 294 315 296 345 304" stroke="#3de8ff" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Right page layer 2 */}
        <path d="M 252 312 C 282 304 315 306 345 314" stroke="#3de8ff" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Right page layer 3 */}
        <path d="M 252 322 C 282 314 315 316 345 323" stroke="#3de8ff" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      {/* 8. Glowing Cyber "CSE" Text at Base of Book */}
      <g filter="url(#textGlow)">
        <text
          x="250"
          y="364"
          textAnchor="middle"
          fill="#3de8ff"
          fontFamily="'JetBrains Mono', 'Poppins', monospace"
          fontSize="36"
          fontWeight="900"
          letterSpacing="0.16em"
          stroke="#00b4ff"
          strokeWidth="1.2"
        >
          CSE
        </text>

        {/* Circuit underline accent */}
        <path d="M 195 372 L 235 372 M 265 372 L 305 372" stroke="#3de8ff" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="235" cy="372" r="2.5" fill="#3de8ff" />
        <circle cx="265" cy="372" r="2.5" fill="#3de8ff" />
      </g>
    </svg>
  );
};
