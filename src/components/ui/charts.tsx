"use client";

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

interface ScoreChartProps {
  score: number;
  title: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreChart({ score, title, color = '#dc2626', size = 'md' }: ScoreChartProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const data = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [color, '#27272a'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} relative`}>
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {score}%
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-zinc-400 mt-2 text-center">
        {title}
      </p>
    </div>
  );
}

interface SkillsRadarProps {
  skills: { skill: string; score: number }[];
}

export function SkillsRadarChart({ skills }: SkillsRadarProps) {
  const data = {
    labels: skills.map(s => s.skill),
    datasets: [
      {
        label: 'Skill Level',
        data: skills.map(s => s.score),
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        borderColor: 'rgba(220, 38, 38, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(220, 38, 38, 1)',
        pointBorderColor: '#18181b',
        pointHoverBackgroundColor: '#18181b',
        pointHoverBorderColor: 'rgba(220, 38, 38, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: false,
        },
        pointLabels: {
          font: {
            size: 11,
          },
          color: '#a1a1aa',
        },
      },
    },
  };

  return (
    <div className="w-80 h-80">
      <Radar data={data} options={options} />
    </div>
  );
}

interface ComparisonBarProps {
  categories: { category: string; current: number; target: number }[];
}

export function ComparisonBarChart({ categories }: ComparisonBarProps) {
  const data = {
    labels: categories.map(c => c.category),
    datasets: [
      {
        label: 'Current Score',
        data: categories.map(c => c.current),
        backgroundColor: 'rgba(220, 38, 38, 0.8)',
        borderColor: 'rgba(220, 38, 38, 1)',
        borderWidth: 1,
      },
      {
        label: 'Target Score',
        data: categories.map(c => c.target),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#a1a1aa',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#71717a',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#a1a1aa',
        },
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Bar data={data} options={options} />
    </div>
  );
}

interface ProgressRingProps {
  percentage: number;
  label: string;
  color: string;
  size?: number;
}

export function ProgressRing({ percentage, label, color, size = 120 }: ProgressRingProps) {
  const radius = (size - 20) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#27272a"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">
            {percentage}%
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-zinc-400 text-center">
        {label}
      </p>
    </div>
  );
}