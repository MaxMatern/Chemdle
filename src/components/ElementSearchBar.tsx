'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChemicalElement, Language } from '@/data/types';
import { elements } from '@/data/elements';
import { Search } from 'lucide-react';
import { getElementName, getElementPrimaryUse, GERMAN_ELEMENT_NAMES, t } from '@/lib/translations';

interface ElementSearchBarProps {
  onSelect: (element: ChemicalElement) => void;
  guessedAtomicNumbers: number[];
  disabled: boolean;
  language: Language;
}

export default function ElementSearchBar({
  onSelect,
  guessedAtomicNumbers,
  disabled,
  language,
}: ElementSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? elements.filter(el => {
        if (guessedAtomicNumbers.includes(el.atomicNumber)) return false;
        const q = query.toLowerCase().trim();
        const deName = (GERMAN_ELEMENT_NAMES[el.atomicNumber] || '').toLowerCase();
        return (
          el.name.toLowerCase().includes(q) ||
          deName.includes(q) ||
          el.symbol.toLowerCase().includes(q) ||
          el.atomicNumber.toString() === q
        );
      })
    : [];

  // Auto-highlight first item when only 1 candidate remains
  useEffect(() => {
    if (filtered.length === 1) {
      setHighlightIndex(0);
    }
  }, [filtered.length]);

  const handleSelect = useCallback(
    (el: ChemicalElement) => {
      onSelect(el);
      setQuery('');
      setIsOpen(false);
      setHighlightIndex(-1);
      inputRef.current?.focus();
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Priority 1: If an item is explicitly highlighted in the list
        if (highlightIndex >= 0 && highlightIndex < filtered.length) {
          handleSelect(filtered[highlightIndex]);
          return;
        }
        // Priority 2: If only 1 recommendation remains, lock it in immediately
        if (filtered.length === 1) {
          handleSelect(filtered[0]);
          return;
        }
        // Priority 3: If exact match by symbol, English name, or German name exists
        const exact = filtered.find(el => {
          const q = query.trim().toLowerCase();
          const deName = (GERMAN_ELEMENT_NAMES[el.atomicNumber] || '').toLowerCase();
          return (
            el.symbol.toLowerCase() === q ||
            el.name.toLowerCase() === q ||
            deName === q
          );
        });
        if (exact) {
          handleSelect(exact);
          return;
        }
        return;
      }

      if (!isOpen || filtered.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightIndex(-1);
          break;
      }
    },
    [isOpen, filtered, highlightIndex, handleSelect, query]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="search-container">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightIndex(-1);
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('searchPlaceholder', language)}
          className="search-input"
          disabled={disabled}
          aria-label={t('searchPlaceholder', language)}
          aria-autocomplete="list"
          aria-expanded={isOpen && filtered.length > 0}
          autoComplete="off"
        />
        {filtered.length === 1 && (
          <span className="search-single-match-hint" title={t('enterToGuess', language)}>
            {t('enterToGuess', language)}
          </span>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="search-dropdown"
          role="listbox"
          aria-label="Element suggestions"
        >
          {filtered.slice(0, 20).map((el, idx) => {
            const localizedName = getElementName(el, language);
            const localizedUse = getElementPrimaryUse(el, language);

            return (
              <li
                key={el.atomicNumber}
                role="option"
                aria-selected={idx === highlightIndex}
                className={`search-dropdown-item ${idx === highlightIndex ? 'highlighted' : ''}`}
                onMouseDown={() => handleSelect(el)}
                onMouseEnter={() => setHighlightIndex(idx)}
              >
                <div className="dropdown-left">
                  <span className="dropdown-symbol">{el.symbol}</span>
                  <span className="dropdown-number">{el.atomicNumber}</span>
                  <span className="dropdown-name">{localizedName}</span>
                </div>
                <div className="dropdown-use" title={localizedUse}>
                  {localizedUse}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
