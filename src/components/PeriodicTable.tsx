'use client';

import React, { useState, useMemo } from 'react';
import { ChemicalElement, GuessEvaluation, Language, ElementCategory } from '@/data/types';
import { elements } from '@/data/elements';
import { getAllCandidateResults, CandidateResult } from '@/lib/candidateFinder';
import { Check, X, Sparkles, Filter, Info, ArrowRight } from 'lucide-react';
import {
  t,
  getElementName,
  getElementPrimaryUse,
  getCategoryLabel,
  getStateLabel,
} from '@/lib/translations';

interface PeriodicTableProps {
  evaluations: GuessEvaluation[];
  onSelectElement: (element: ChemicalElement) => void;
  disabled: boolean;
  colorblindMode: boolean;
  language: Language;
}

const CATEGORY_COLORS: Record<string, string> = {
  'alkali-metal': '#ef4444',
  'alkaline-earth-metal': '#f97316',
  'transition-metal': '#3b82f6',
  'post-transition-metal': '#06b6d4',
  'metalloid': '#10b981',
  'reactive-nonmetal': '#8b5cf6',
  'halogen': '#ec4899',
  'noble-gas': '#6366f1',
  'lanthanide': '#f59e0b',
  'actinide': '#14b8a6',
};

const CATEGORY_NAMES: Record<string, string> = {
  'alkali-metal': 'Alkali Metal',
  'alkaline-earth-metal': 'Alkaline Earth',
  'transition-metal': 'Transition Metal',
  'post-transition-metal': 'Post-trans. Metal',
  'metalloid': 'Metalloid',
  'reactive-nonmetal': 'Reactive Nonmetal',
  'halogen': 'Halogen',
  'noble-gas': 'Noble Gas',
  'lanthanide': 'Lanthanide',
  'actinide': 'Actinide',
};

export default function PeriodicTable({
  evaluations,
  onSelectElement,
  disabled,
  colorblindMode,
  language,
}: PeriodicTableProps) {
  const [filterOnlyFitting, setFilterOnlyFitting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ChemicalElement | null>(null);

  // Compute candidate fit status for all 118 elements
  const candidateResults = useMemo(() => {
    return getAllCandidateResults(evaluations, elements);
  }, [evaluations]);

  const candidateMap = useMemo(() => {
    const map = new Map<number, CandidateResult>();
    candidateResults.forEach(res => map.set(res.element.atomicNumber, res));
    return map;
  }, [candidateResults]);

  const fittingCount = useMemo(() => {
    return candidateResults.filter(r => r.fits).length;
  }, [candidateResults]);

  // Main table: periods 1-7 (groups 1-18)
  const mainGridElements = useMemo(() => {
    return elements.filter(el => el.group !== null);
  }, []);

  // Lanthanides (57-71) & Actinides (89-103)
  const lanthanides = useMemo(() => {
    return elements.filter(el => el.category === 'lanthanide');
  }, []);

  const actinides = useMemo(() => {
    return elements.filter(el => el.category === 'actinide');
  }, []);

  const selectedResult = selectedElement
    ? candidateMap.get(selectedElement.atomicNumber)
    : null;

  const renderCell = (
    el: ChemicalElement,
    gridRow?: number,
    gridColumn?: number
  ) => {
    const res = candidateMap.get(el.atomicNumber);
    const fits = res?.fits ?? true;
    const isGuessed = res?.isGuessed ?? false;
    const isSelected = selectedElement?.atomicNumber === el.atomicNumber;
    const isFilteredOut = filterOnlyFitting && !fits;
    const localizedName = getElementName(el, language);
    const localizedUse = getElementPrimaryUse(el, language);

    return (
      <button
        key={el.atomicNumber}
        type="button"
        className={`pt-cell ${fits ? 'pt-cell-fits' : 'pt-cell-eliminated'} ${
          isGuessed ? 'pt-cell-guessed' : ''
        } ${isSelected ? 'pt-cell-selected' : ''} ${isFilteredOut ? 'pt-cell-hidden' : ''}`}
        style={{
          gridRow: gridRow ?? el.period,
          gridColumn: gridColumn ?? (el.group ?? 1),
          '--cat-color': CATEGORY_COLORS[el.category] || '#6366f1',
        } as React.CSSProperties}
        onClick={() => setSelectedElement(el)}
        title={`${localizedName} (${el.symbol}) #${el.atomicNumber}\n${t('ptPrimaryApp', language)} ${localizedUse}\nStatus: ${
          fits ? t('ptFitsClues', language) : (res?.eliminationReason || t('ptEliminated', language))
        }`}
        aria-label={`${localizedName}, ${fits ? t('ptFitsClues', language) : t('ptEliminated', language)}`}
      >
        <span className="pt-cell-num">{el.atomicNumber}</span>
        <span className="pt-cell-symbol">{el.symbol}</span>
        {fits && <span className="pt-fit-dot" />}
        {isGuessed && <span className="pt-guessed-check">✓</span>}
      </button>
    );
  };

  return (
    <div className={`periodic-table-card ${colorblindMode ? 'colorblind' : ''}`}>
      {/* Header and Controls */}
      <div className="pt-header">
        <div className="pt-header-left">
          <div className="pt-badge">
            <Sparkles size={14} className="pt-badge-icon" />
            <span>{t('easyMode', language)}</span>
          </div>
          <h2 className="pt-title">{t('ptTitle', language)}</h2>
        </div>

        <div className="pt-controls">
          <div
            className="pt-candidates-stat"
            title="Remaining elements matching all discovered feedback clues"
          >
            <span className="pt-stat-count">{fittingCount}</span>
            <span className="pt-stat-label">/ 118 {t('ptCandidatesSuffix', language)}</span>
          </div>

          <button
            className={`pt-filter-toggle ${filterOnlyFitting ? 'active' : ''}`}
            onClick={() => setFilterOnlyFitting(prev => !prev)}
            aria-pressed={filterOnlyFitting}
            title={filterOnlyFitting ? t('ptShowAll', language) : t('ptFocusFitting', language)}
          >
            <Filter size={13} />
            <span>{filterOnlyFitting ? t('ptShowAll', language) : t('ptFocusFitting', language)}</span>
          </button>
        </div>
      </div>

      {/* Selected Element Quick Inspector */}
      {selectedElement && selectedResult ? (
        <div className="pt-inspector-banner">
          <div className="pt-inspector-left">
            <div
              className="pt-inspector-symbol-box"
              style={{ borderColor: CATEGORY_COLORS[selectedElement.category] || '#6366f1' }}
            >
              <span className="pt-inspector-number">{selectedElement.atomicNumber}</span>
              <span className="pt-inspector-symbol">{selectedElement.symbol}</span>
            </div>

            <div className="pt-inspector-details">
              <div className="pt-inspector-name-row">
                <span className="pt-inspector-name">{getElementName(selectedElement, language)}</span>
                <span
                  className="pt-inspector-category-badge"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[selectedElement.category]}25`,
                    color: CATEGORY_COLORS[selectedElement.category],
                  }}
                >
                  {getCategoryLabel(selectedElement.category, language)}
                </span>

                {selectedResult.fits ? (
                  <span className="pt-fit-badge pt-fit-badge-yes">
                    <Check size={11} /> {t('ptFitsClues', language)}
                  </span>
                ) : (
                  <span className="pt-fit-badge pt-fit-badge-no" title={selectedResult.eliminationReason}>
                    <X size={11} /> {selectedResult.eliminationReason || t('ptEliminated', language)}
                  </span>
                )}
              </div>

              <div className="pt-inspector-use">
                <span className="pt-use-label">{t('ptPrimaryApp', language)}</span>
                <span className="pt-use-text">{getElementPrimaryUse(selectedElement, language)}</span>
              </div>

              <div className="pt-inspector-properties">
                <span>{t('ptPeriod', language)} <strong>{selectedElement.period}</strong></span>
                <span>{t('ptGroup', language)} <strong>{selectedElement.group ?? 'f-block'}</strong></span>
                <span>{t('ptBlock', language)} <strong>{selectedElement.block}</strong></span>
                <span>{t('ptState', language)} <strong>{getStateLabel(selectedElement.standardState, language)}</strong></span>
                <span>{t('ptMass', language)} <strong>{selectedElement.atomicMass} u</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-inspector-right">
            {!disabled && !selectedResult.isGuessed && (
              <button
                className="pt-guess-btn"
                onClick={() => {
                  onSelectElement(selectedElement);
                  setSelectedElement(null);
                }}
              >
                <span>{t('ptGuessBtn', language)} {selectedElement.symbol}</span>
                <ArrowRight size={14} />
              </button>
            )}
            {selectedResult.isGuessed && (
              <span className="pt-already-guessed-label">{t('ptAlreadyGuessed', language)}</span>
            )}
            <button
              className="pt-inspector-close-btn"
              onClick={() => setSelectedElement(null)}
              aria-label="Close inspector"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-hint-strip">
          <Info size={13} className="pt-hint-icon" />
          <span>{t('ptHint', language)}</span>
        </div>
      )}

      {/* Unified 18-Column Periodic Table Grid */}
      <div className="pt-scroll-wrapper">
        <div className="pt-unified-grid">
          {/* Main 7 periods */}
          {mainGridElements.map(el => renderCell(el))}

          {/* Lanthanide placeholder in Period 6, Group 3 */}
          <div
            className="pt-cell pt-placeholder-cell"
            style={{ gridRow: 6, gridColumn: 3 }}
            title="Lanthanide series (57-71 La-Lu)"
          >
            <span className="pt-placeholder-label">57-71</span>
            <span className="pt-placeholder-sub">La-Lu</span>
          </div>

          {/* Actinide placeholder in Period 7, Group 3 */}
          <div
            className="pt-cell pt-placeholder-cell"
            style={{ gridRow: 7, gridColumn: 3 }}
            title="Actinide series (89-103 Ac-Lr)"
          >
            <span className="pt-placeholder-label">89-103</span>
            <span className="pt-placeholder-sub">Ac-Lr</span>
          </div>

          {/* Row 8: Spacer gap */}
          <div className="pt-grid-spacer" style={{ gridRow: 8, gridColumn: '1 / span 18' }} />

          {/* Row 9: Lanthanides series label in cols 1-3 */}
          <div
            className="pt-fblock-label-cell"
            style={{ gridRow: 9, gridColumn: '1 / span 3' }}
          >
            <span>{t('ptLanthanidesLabel', language)}</span>
          </div>

          {/* Row 9: Lanthanide elements 57-71 in cols 4-18 */}
          {lanthanides.map((el, idx) => renderCell(el, 9, idx + 4))}

          {/* Row 10: Actinides series label in cols 1-3 */}
          <div
            className="pt-fblock-label-cell"
            style={{ gridRow: 10, gridColumn: '1 / span 3' }}
          >
            <span>{t('ptActinidesLabel', language)}</span>
          </div>

          {/* Row 10: Actinide elements 89-103 in cols 4-18 */}
          {actinides.map((el, idx) => renderCell(el, 10, idx + 4))}
        </div>
      </div>

      {/* Category Legend */}
      <div className="pt-legend">
        <div className="pt-legend-items">
          {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
            <div key={key} className="pt-legend-item">
              <span className="pt-legend-dot" style={{ backgroundColor: color }} />
              <span>{getCategoryLabel(key as ElementCategory, language)}</span>
            </div>
          ))}
          <div className="pt-legend-item">
            <span className="pt-legend-dot pt-legend-dot-candidate" />
            <span>{t('ptFitsClues', language)}</span>
          </div>
          <div className="pt-legend-item">
            <span className="pt-legend-dot pt-legend-dot-eliminated" />
            <span>{t('ptEliminated', language)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
