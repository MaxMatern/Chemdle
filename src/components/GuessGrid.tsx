'use client';

import React, { useEffect, useState } from 'react';
import { GuessEvaluation, FeedbackState, Direction, Language } from '@/data/types';
import { ArrowUp, ArrowDown } from 'lucide-react';
import {
  t,
  getElementName,
  getElementPrimaryUse,
  getCategoryLabel,
  getStateLabel,
} from '@/lib/translations';

interface GuessGridProps {
  evaluations: GuessEvaluation[];
  colorblindMode: boolean;
  temperatureUnit: 'K' | 'C';
  latestRowIndex: number;
  language: Language;
}

const COLUMN_HEADERS = [
  { label: 'Element', icon: '⚛' },
  { label: 'Category', icon: '🧪' },
  { label: 'Period / Group', icon: '📍' },
  { label: 'Block', icon: '🔲' },
  { label: 'State', icon: '🌡' },
  { label: 'Mass (u)', icon: '⚖' },
  { label: 'Electroneg.', icon: '⚡' },
  { label: 'Melt Pt', icon: '🔥' },
];

function formatMeltingPoint(value: string | number, unit: 'K' | 'C'): string {
  if (typeof value === 'string') {
    if (value === 'N/A') return value;
    const match = value.match(/([\d.]+)\s*K/);
    if (!match) return value;
    const kelvin = parseFloat(match[1]);
    if (unit === 'C') return `${(kelvin - 273.15).toFixed(0)}°C`;
    return `${kelvin} K`;
  }
  if (unit === 'C') return `${(value - 273.15).toFixed(0)}°C`;
  return `${value} K`;
}

// ——————————————————————————————————
// Tile Component with 3D flip
// ——————————————————————————————————

interface TileProps {
  value: string | number;
  state: FeedbackState;
  direction?: Direction;
  label?: string;
  colIndex: number;
  isLatest: boolean;
  colorblindMode: boolean;
  ariaLabel: string;
  isElementTile?: boolean;
  atomicNumber?: number;
  symbol?: string;
  emoji?: string;
  primaryUse?: string;
}

function Tile({
  value,
  state,
  direction,
  label,
  colIndex,
  isLatest,
  colorblindMode,
  ariaLabel,
  isElementTile,
  atomicNumber,
  symbol,
  emoji,
  primaryUse,
}: TileProps) {
  const [flipped, setFlipped] = useState(!isLatest);
  const [showColor, setShowColor] = useState(!isLatest);

  useEffect(() => {
    if (!isLatest) {
      setFlipped(true);
      setShowColor(true);
      return;
    }
    const flipDelay = colIndex * 120;
    const colorDelay = flipDelay + 300;

    const flipTimer = setTimeout(() => setFlipped(true), flipDelay);
    const colorTimer = setTimeout(() => setShowColor(true), colorDelay);

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(colorTimer);
    };
  }, [colIndex, isLatest]);

  const stateClass = showColor
    ? colorblindMode
      ? `tile-${state}-cb`
      : `tile-${state}`
    : 'tile-neutral';

  const dirArrow =
    direction === 'up' ? (
      <ArrowUp className="tile-arrow" size={13} strokeWidth={2.5} />
    ) : direction === 'down' ? (
      <ArrowDown className="tile-arrow" size={13} strokeWidth={2.5} />
    ) : null;

  return (
    <div
      className={`tile-wrapper ${flipped ? 'tile-flipped' : ''}`}
      aria-label={ariaLabel}
      role="cell"
    >
      <div className="tile-inner">
        <div className="tile-front" />
        <div className={`tile-back ${stateClass}`}>
          {isElementTile ? (
            <div
              className="tile-element-content"
              title={`${value.toString().split(' - ')[1]} (${symbol}) #${atomicNumber}\nPrimary use: ${primaryUse || ''}`}
            >
              <span className="tile-atomic-badge">{atomicNumber}</span>
              <span className="tile-element-symbol">{symbol}</span>
              <span className="tile-element-name">{value.toString().split(' - ')[1]}</span>
            </div>
          ) : (
            <>
              <span className="tile-value">
                {value}
                {dirArrow}
              </span>
              {label && <span className="tile-label">{label}</span>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ——————————————————————————————————
// Period/Group Composite Tile
// ——————————————————————————————————

interface PeriodGroupTileProps {
  evaluation: GuessEvaluation;
  colIndex: number;
  isLatest: boolean;
  colorblindMode: boolean;
}

function PeriodGroupTile({
  evaluation,
  colIndex,
  isLatest,
  colorblindMode,
}: PeriodGroupTileProps) {
  const pg = evaluation.periodGroupCell;

  const periodArrow =
    pg.periodDirection === 'up' ? '↑' : pg.periodDirection === 'down' ? '↓' : '';
  const groupArrow =
    pg.groupDirection === 'up' ? '↑' : pg.groupDirection === 'down' ? '↓' : '';

  const groupDisplay =
    evaluation.element.group !== null
      ? `G:${evaluation.element.group}`
      : 'G:f';

  const display = `P:${evaluation.element.period}${periodArrow} ${groupDisplay}${groupArrow}`;

  const ariaLabel = `Period: ${evaluation.element.period}, ${
    pg.periodState === 'correct' ? 'correct' : `target period is ${pg.periodDirection}`
  }. Group: ${evaluation.element.group ?? 'f-block'}, ${
    pg.groupState === 'correct' ? 'correct' : `target group is ${pg.groupDirection}`
  }.`;

  return (
    <Tile
      value={display}
      state={pg.overallState}
      colIndex={colIndex}
      isLatest={isLatest}
      colorblindMode={colorblindMode}
      ariaLabel={ariaLabel}
    />
  );
}

// ——————————————————————————————————
// Guess Row
// ——————————————————————————————————

interface GuessRowProps {
  evaluation: GuessEvaluation;
  isLatest: boolean;
  colorblindMode: boolean;
  temperatureUnit: 'K' | 'C';
  language: Language;
}

function GuessRow({ evaluation, isLatest, colorblindMode, temperatureUnit, language }: GuessRowProps) {
  const ev = evaluation;
  const isVictory = ev.isVictory;
  const localizedName = getElementName(ev.element, language);
  const localizedUse = getElementPrimaryUse(ev.element, language);
  const localizedCategory = getCategoryLabel(ev.element.category, language);
  const localizedState = getStateLabel(ev.element.standardState, language);

  return (
    <div
      className={`guess-row ${isVictory && !isLatest ? 'victory-row' : ''} ${
        isVictory && isLatest ? 'victory-row-animate' : ''
      }`}
      role="row"
    >
      <Tile
        value={`${ev.element.symbol} - ${localizedName}`}
        state={ev.elementCell.state}
        colIndex={0}
        isLatest={isLatest}
        colorblindMode={colorblindMode}
        ariaLabel={`Element: ${localizedName} (${ev.element.symbol}), #${ev.element.atomicNumber}. ${
          ev.elementCell.state === 'correct' ? 'Correct!' : 'Incorrect.'
        }. Use: ${localizedUse}`}
        isElementTile
        atomicNumber={ev.element.atomicNumber}
        symbol={ev.element.symbol}
        emoji={ev.element.emoji}
        primaryUse={localizedUse}
      />

      <Tile
        value={localizedCategory}
        state={ev.categoryCell.state}
        colIndex={1}
        isLatest={isLatest}
        colorblindMode={colorblindMode}
        ariaLabel={`Category: ${localizedCategory}. ${
          ev.categoryCell.state === 'correct'
            ? 'Correct.'
            : ev.categoryCell.state === 'partial'
            ? 'Same meta-group.'
            : 'Different group.'
        }`}
      />

      <PeriodGroupTile
        evaluation={ev}
        colIndex={2}
        isLatest={isLatest}
        colorblindMode={colorblindMode}
      />

      <Tile
        value={ev.blockCell.value.toString().toUpperCase()}
        state={ev.blockCell.state}
        colIndex={3}
        isLatest={isLatest}
        colorblindMode={colorblindMode}
        ariaLabel={`Block: ${ev.blockCell.value}. ${
          ev.blockCell.state === 'correct' ? 'Correct.' : 'Incorrect.'
        }`}
      />

      <Tile
        value={localizedState}
        state={ev.stateCell.state}
        colIndex={4}
        isLatest={isLatest}
        colorblindMode={colorblindMode}
        ariaLabel={`Standard State: ${localizedState}. ${
          ev.stateCell.state === 'correct' ? 'Correct.' : 'Incorrect.'
        }`}
      />

      <Tile
        value={typeof ev.massCell.value === 'number' ? ev.massCell.value.toFixed(2) : ev.massCell.value}
        state={ev.massCell.state}
        direction={ev.massCell.direction}
        colIndex={5}
        isLatest={isLatest}
        colorblindMode={colorblindMode}
        ariaLabel={`Atomic Mass: ${ev.massCell.value} u. ${
          ev.massCell.state === 'correct'
            ? 'Correct.'
            : `Target is ${ev.massCell.direction === 'up' ? 'higher' : 'lower'}.`
        }`}
      />

      <Tile
        value={
          typeof ev.electronegativityCell.value === 'number'
            ? ev.electronegativityCell.value.toFixed(2)
            : ev.electronegativityCell.value
        }
        state={ev.electronegativityCell.state}
        direction={ev.electronegativityCell.direction}
        label={ev.electronegativityCell.label}
        colIndex={6}
        isLatest={isLatest}
        colorblindMode={colorblindMode}
        ariaLabel={`Electronegativity: ${ev.electronegativityCell.value}. ${
          ev.electronegativityCell.state === 'correct'
            ? 'Correct.'
            : ev.electronegativityCell.direction !== 'none'
            ? `Target is ${ev.electronegativityCell.direction === 'up' ? 'higher' : 'lower'}.`
            : 'Unknown property.'
        }`}
      />

      <Tile
        value={formatMeltingPoint(ev.meltingPointCell.value, temperatureUnit)}
        state={ev.meltingPointCell.state}
        direction={ev.meltingPointCell.direction}
        label={ev.meltingPointCell.label}
        colIndex={7}
        isLatest={isLatest}
        colorblindMode={colorblindMode}
        ariaLabel={`Melting Point: ${ev.meltingPointCell.value}. ${
          ev.meltingPointCell.state === 'correct'
            ? 'Correct.'
            : ev.meltingPointCell.direction !== 'none'
            ? `Target is ${ev.meltingPointCell.direction === 'up' ? 'higher' : 'lower'}.`
            : 'Unknown property.'
        }`}
      />
    </div>
  );
}

// ——————————————————————————————————
// Main Grid
// ——————————————————————————————————

export default function GuessGrid({
  evaluations,
  colorblindMode,
  temperatureUnit,
  latestRowIndex,
  language,
}: GuessGridProps) {
  const columnHeaders = [
    { label: t('colElement', language), icon: '⚛' },
    { label: t('colCategory', language), icon: '🧪' },
    { label: t('colPeriodGroup', language), icon: '📍' },
    { label: t('colBlock', language), icon: '🔲' },
    { label: t('colState', language), icon: '🌡' },
    { label: t('colMass', language), icon: '⚖' },
    { label: t('colElectroneg', language), icon: '⚡' },
    { label: t('colMeltPt', language), icon: '🔥' },
  ];

  if (evaluations.length === 0) {
    return (
      <div className="guess-grid-empty">
        <div className="empty-state">
          <div className="empty-atom">⚛️</div>
          <p>{language === 'de' ? 'Finde das geheime chemische Element' : 'Identify the mystery element'}</p>
          <p className="empty-hint">{language === 'de' ? 'Suche nach Name, Symbol oder Ordnungszahl' : 'Search by name, symbol, or atomic number'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guess-grid-wrapper">
      <div className="guess-grid" role="table" aria-label="Guess results">
        <div className="guess-header" role="row">
          {columnHeaders.map(h => (
            <div key={h.label} className="header-cell" role="columnheader">
              <span className="header-icon">{h.icon}</span>
              {h.label}
            </div>
          ))}
        </div>

        {evaluations.map((ev, idx) => (
          <GuessRow
            key={ev.id}
            evaluation={ev}
            isLatest={idx === latestRowIndex}
            colorblindMode={colorblindMode}
            temperatureUnit={temperatureUnit}
            language={language}
          />
        ))}
      </div>
    </div>
  );
}
