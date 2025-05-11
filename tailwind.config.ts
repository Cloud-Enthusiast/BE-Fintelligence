
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				finance: {
					50: '#f0f7fe',
					100: '#e0f2fe',
					200: '#bae2fd',
					300: '#7ccbfd',
					400: '#36aff9',
					500: '#0070F3', // Primary: Vibrant Blue
					600: '#0263d1',
					700: '#0351ab',
					800: '#04438c',
					900: '#093974',
					950: '#061f43',
				},
				gold: {
					50: '#fffbeb',
					100: '#fff4c6',
					200: '#fee989',
					300: '#FFC658', // Secondary: Warm Gold
					400: '#fdbc2a',
					500: '#f79e09',
					600: '#db7805',
					700: '#b35309',
					800: '#934011',
					900: '#7a3612',
					950: '#461a03',
				},
				purple: {
					50: '#f6f2ff',
					100: '#ede6ff',
					200: '#daccff',
					300: '#c4a8ff',
					400: '#ab7cff',
					500: '#9b87f5', // Primary: Rich Purple
					600: '#7e69ab',
					700: '#6a4695',
					800: '#553878',
					900: '#402b59',
					950: '#2c1a45',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.97)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-500px 0' },
					'100%': { backgroundPosition: '500px 0' }
				},
				'float': {
					'0%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
					'100%': { transform: 'translateY(0)' }
				},
				'pulse-gold': {
					'0%': { boxShadow: '0 0 0 0 rgba(255, 198, 88, 0.4)' },
					'70%': { boxShadow: '0 0 0 10px rgba(255, 198, 88, 0)' },
					'100%': { boxShadow: '0 0 0 0 rgba(255, 198, 88, 0)' }
				},
				'pulse-purple': {
					'0%': { boxShadow: '0 0 0 0 rgba(155, 135, 245, 0.4)' },
					'70%': { boxShadow: '0 0 0 10px rgba(155, 135, 245, 0)' },
					'100%': { boxShadow: '0 0 0 0 rgba(155, 135, 245, 0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-up': 'fade-up 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'shimmer': 'shimmer 2s infinite linear',
				'float': 'float 3s ease-in-out infinite',
				'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'pulse-purple': 'pulse-purple 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif']
			},
			backgroundImage: {
				'gradient-app': 'linear-gradient(to bottom, #f8f4ff, #f2ebff)',
				'gradient-gold': 'linear-gradient(to right, #FFC658, #FFEDBD, #FFC658)',
				'gradient-purple': 'linear-gradient(to right, #9b87f5, #c4a8ff, #9b87f5)',
				'gradient-purple-gold': 'linear-gradient(to right, #9b87f5, #FFC658)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
