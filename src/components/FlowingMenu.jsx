'use client';

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import './FlowingMenu.css';

/**
 * FlowingMenu Component (React Bits)
 * High-performance animated flowing menu with GSAP marquee and directional enter/exit.
 */
const FlowingMenu = ({
  items = [],
  speed = 15,
  textColor = '#ffffff',
  bgColor = '#120F17',
  marqueeBgColor = '#ffffff',
  marqueeTextColor = '#120F17',
  borderColor = 'rgba(255, 255, 255, 0.15)'
}) => {
  return (
    <div className="flowing-menu-root w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      <nav className="flowing-menu-nav flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
            {...item}
          />
        ))}
      </nav>
    </div>
  );
};

const MenuItem = ({
  link = '#',
  text = '',
  tag = '',
  subtext = '',
  actionHint = '',
  marqueeText = '',
  image = '',
  itemBgColor = '',
  itemTextColor = '#ffffff',
  tagBgColor = '',
  tagTextColor = '',
  onClick,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  isFirst
}) => {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.6, ease: 'expo' };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part');
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth || 300;
      const viewportWidth = window.innerWidth || 1200;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text, marqueeText, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part');
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1
      });
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, marqueeText, image, repetitions, speed]);

  const handleMouseEnter = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const clientX = ev.clientX ?? (ev.touches && ev.touches[0] ? ev.touches[0].clientX : rect.left + rect.width / 2);
    const clientY = ev.clientY ?? (ev.touches && ev.touches[0] ? ev.touches[0].clientY : rect.top + rect.height / 2);
    const edge = findClosestEdge(clientX - rect.left, clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const clientX = ev.clientX ?? (ev.changedTouches && ev.changedTouches[0] ? ev.changedTouches[0].clientX : rect.left + rect.width / 2);
    const clientY = ev.clientY ?? (ev.changedTouches && ev.changedTouches[0] ? ev.changedTouches[0].clientY : rect.top + rect.height / 2);
    const edge = findClosestEdge(clientX - rect.left, clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="flowing-menu-item"
      ref={itemRef}
      style={{
        borderTop: isFirst ? 'none' : `1px solid ${borderColor}`,
        background: itemBgColor || undefined
      }}
    >
      <a
        className="flowing-menu-link"
        href={link}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        style={{ color: itemTextColor || textColor }}
      >
        {tag && (
          <span
            className="flowing-item-tag"
            style={{
              backgroundColor: tagBgColor || undefined,
              color: tagTextColor || undefined,
              borderColor: tagTextColor ? `${tagTextColor}55` : undefined
            }}
          >
            {tag}
          </span>
        )}
        <span className="flowing-item-title">{text}</span>
        {subtext && <span className="flowing-item-subtext">{subtext}</span>}
        <span className="flowing-item-action-hint">
          {actionHint || 'Haz clic para expandir ventana'} ↗
        </span>
      </a>
      <div
        className="flowing-menu-marquee"
        ref={marqueeRef}
        style={{ background: marqueeBgColor }}
      >
        <div className="flowing-menu-marquee-inner" ref={marqueeInnerRef}>
          {[...Array(repetitions)].map((_, idx) => (
            <div
              className="flowing-menu-marquee-part marquee-part"
              key={idx}
              style={{ color: marqueeTextColor }}
            >
              <span className="flowing-menu-marquee-text">
                {marqueeText || text}
              </span>
              <div
                className="flowing-menu-marquee-img"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowingMenu;
