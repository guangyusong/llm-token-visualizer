import './App.css';
import './Tabs.css';

import { useEffect, useState } from 'react';

import { getEncoding } from 'js-tiktoken';

type EncodedToken = [substring: string, token: number];
type TiktokenEncoding = 'gpt2' | 'r50k_base' | 'p50k_base' | 'p50k_edit' | 'cl100k_base';

const convertNumberToColor = (number: number): string => {
	const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;
	const hue = (number * GOLDEN_RATIO_CONJUGATE * 360) % 360;
	return `hsl(${hue}, 60%, 85%)`;
};

const encodeTextToTokens = (text: string, tiktoken: any): EncodedToken[] => {
	const tokens = tiktoken.encode(text);
	return tokens.map((token: any): EncodedToken => [tiktoken.decode([token]), token]);
};

const TextWithColors = ({ encodedTokens }: { encodedTokens: EncodedToken[] }) => {
	return (
		<div className="tokens-visualized">
			{encodedTokens.map(([substring, token], index) => (
				<span
					key={index}
					title={token.toString()}
					className="token-span"
					style={{ backgroundColor: convertNumberToColor(token) }}
				>
					{substring}
				</span>
			))}
		</div>
	);
};

const App = () => {
	const [inputValue, setInputValue] = useState('');
	const [encodedTokens, setEncodedTokens] = useState<EncodedToken[]>([]);
	const [tokenCount, setTokenCount] = useState(0);
	const [charCount, setCharCount] = useState(0);
	const [encodingType, setEncodingType] = useState<TiktokenEncoding>('cl100k_base');

	const handleTextInputChange = (e: any) => {
		setInputValue(e.target.value);
	};

	const handleExampleButtonClick = () => {
		const exampleText = `Tokens are pieces of text that the model reads at once. For instance, in English language modeling, a token can be as short as one character or as long as one word (e.g., a or apple). The tokenizer takes a piece of text and breaks it into tokens, which the model then processes. Different tokenizers might break up text in different ways. For example, some might split by spaces and punctuation, while others might understand and keep together common words or phrases.`;
		setInputValue(exampleText);
	};

	useEffect(() => {
		setCharCount(inputValue.length);
		setTokenCount(inputValue.split(/\s+/).filter(Boolean).length);

		const tiktoken = getEncoding(encodingType);
		setEncodedTokens(encodeTextToTokens(inputValue, tiktoken));
	}, [inputValue, encodingType]);

	return (
		<div className="App">
			<header className="App-header">
				<h2>Visualize LLM Tokens</h2>
				<div className="tabs-container">
					{[
						{ key: 'gpt2', label: 'GPT2' },
						{ key: 'cl100k_base', label: 'GPT3.5 / GPT4' },
					].map(({ key, label }) => (
						<button
							key={key}
							className={`tab-button ${encodingType === key ? 'selected' : ''}`}
							onClick={() => setEncodingType(key as TiktokenEncoding)}
						>
							{label}
						</button>
					))}
				</div>
				<textarea
					id="tokenizer-input"
					placeholder="Enter some text to see how it might be tokenized by a language model"
					value={inputValue}
					onChange={handleTextInputChange}
					rows={6}
				/>
				<div className="tokenizer-buttons">
					<div className="counts">
						<span>Tokens: {tokenCount}</span>
						<span>Characters: {charCount}</span>
					</div>
					<div className="button-container">
						<button
							onClick={() => {
								setInputValue('');
								setTokenCount(0);
								setCharCount(0);
							}}
						>
							Clear
						</button>
						<button onClick={handleExampleButtonClick}>Show example</button>
					</div>
				</div>
				<TextWithColors encodedTokens={encodedTokens} />
			</header>
		</div>
	);
};

export default App;
