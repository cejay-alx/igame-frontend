import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	{
		ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
				},
			],
			'react/no-unescaped-entities': [
				'error',
				{
					forbid: [
						{
							char: "'",
							alternatives: ['&apos;'],
						},
						{
							char: '"',
							alternatives: ['&quot;'],
						},
					],
				},
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'prefer-const': 'error',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'@next/next/no-img-element': 'warn',
		},
	},
];

export default eslintConfig;
