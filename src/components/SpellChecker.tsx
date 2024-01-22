import { h, FunctionComponent } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

type Suggestion = { word: string; distance: number };

const SpellChecker: FunctionComponent = () => {
  const [inputWord, setInputWord] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setInputWord(target.value);
  };

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const words = text.split(/\r?\n/);
          setDictionary(words);
        }
      };

      reader.readAsText(target.files[0]);
    }
  };
  const wagnerFischer = (s1: string, s2: string): number => {
    let len_s1 = s1.length;
    let len_s2 = s2.length;
  
    // Initialize a matrix
    let matrix: number[][] = Array.from({ length: len_s1 + 1 }, () => Array(len_s2 + 1).fill(0));
  
    // Fill the first row and column of the matrix
    for (let i = 0; i <= len_s1; i++) {
        matrix[i][0] = i;
    }
    for (let j = 0; j <= len_s2; j++) {
        matrix[0][j] = j;
    }
  
    // Compute the edit distance
    for (let i = 1; i <= len_s1; i++) {
        for (let j = 1; j <= len_s2; j++) {
            let cost = (s1[i - 1] === s2[j - 1]) ? 0 : 1;
            
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,     // Deletion
                matrix[i][j - 1] + 1,     // Insertion
                matrix[i - 1][j - 1] + cost // Substitution
            );
        }
    }
  
    return matrix[len_s1][len_s2];
  };
  

  const spellCheck = (word: string): Suggestion[] => {
    let suggestions = dictionary.map(correctWord => {
      return {
        word: correctWord,
        distance: wagnerFischer(word, correctWord)
      };
    });

    return suggestions.sort((a, b) => a.distance - b.distance).slice(0, 10);
  };
  // Update suggestions when inputWord changes
  useEffect(() => {
    if (inputWord && dictionary.length > 0) {
      setSuggestions(spellCheck(inputWord));
    } else {
      setSuggestions([]);
    }
  }, [inputWord, dictionary]);

  return (
    <div>
      <h2>Spell Checker</h2>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt"
          style={{ marginBottom: '10px' }}
        />
      </div>
      <div>
        <input
          type="text"
          value={inputWord}
          placeholder="Enter a word"
          onInput={handleInputChange}
          style={{ marginBottom: '10px' }}
        />
      </div>
      <ul>
        {suggestions.map(({ word, distance }, index) => (
          <li key={word} style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
            {word} (Distance: {distance})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SpellChecker;