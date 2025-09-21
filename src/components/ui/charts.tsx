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

export function ScoreChart({ score, title, color = '#3B82F6', size = 'md' }: ScoreChartProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const data = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [color, '#E5E7EB'],
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
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {score}%
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 text-center">
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
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
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
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: false,
        },
        pointLabels: {
          font: {
            size: 12,
          },
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
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
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
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
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
            stroke="#E5E7EB"
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
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {percentage}%
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
        {label}
      </p>
    </div>
  );
}