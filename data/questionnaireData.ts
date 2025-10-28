import type { QuestionnaireSection } from '../types';

export const questionnaire: QuestionnaireSection[] = [
  {
    title: 'Room Details',
    questions: [
      {
        id: 'roomType',
        text: 'What is the primary function of this room?',
        type: 'select',
        options: [
          { label: 'Conference Room', value: 'conference' },
          { label: 'Huddle Room', value: 'huddle' },
          { label: 'Boardroom', value: 'boardroom' },
          { label: 'Classroom / Training Room', value: 'classroom' },
          { label: 'Auditorium', value: 'auditorium' },
          { label: 'Town Hall / All-Hands Space', value: 'town_hall' },
          { label: 'Experience Center', value: 'experience_center' },
          { label: 'NOC / Command Center', value: 'noc' },
          { label: 'Executive Office', value: 'executive_office' },
          { label: 'Lobby / Digital Signage', value: 'lobby' },
        ],
      },
      { id: 'dimensions', text: 'What are the approximate room dimensions? (e.g., 8m x 6m)', type: 'text' },
      { id: 'capacity', text: 'How many people will the room typically accommodate?', type: 'number' },
    ],
  },
  {
    title: 'Display Needs',
    questions: [
      {
        id: 'displayType',
        text: 'What kind of main display is needed?',
        type: 'multiple-choice',
        options: [
          { label: 'Single Large Format Display (LFD)', value: 'single_lfd' },
          { label: 'Dual Large Format Displays (LFDs)', value: 'dual_lfd' },
          { label: 'Video Wall', value: 'video_wall' },
          { label: 'Projector and Screen', value: 'projector' },
        ],
      },
       { id: 'displayResolution', text: 'What resolution is required for the main display?', type: 'select', options: [ {label: "Full HD (1080p)", value: "FHD"}, {label: "4K (UHD)", value: "4K"}] },
    ],
  },
  {
    title: 'Audio & Conferencing',
    questions: [
      {
        id: 'conferencing',
        text: 'Will video conferencing be used in this room?',
        type: 'select',
        options: [
          { label: 'Yes, frequently', value: 'yes' },
          { label: 'Occasionally', value: 'sometimes' },
          { label: 'No', value: 'no' },
        ],
      },
      {
        id: 'audioNeeds',
        text: 'What are the primary audio requirements?',
        type: 'multiple-choice',
        options: [
          { label: 'Clear voice reproduction for meetings (Speech Reinforcement)', value: 'speech' },
          { label: 'High-quality audio for presentations with video/music', value: 'presentation_audio' },
          { label: 'Ceiling microphones for clean table space', value: 'ceiling_mics' },
          { label: 'Tabletop microphones for flexibility', value: 'table_mics' },
        ],
      },
    ],
  },
  {
    title: 'Connectivity & Control',
    questions: [
      {
        id: 'connectivity',
        text: 'How will users connect to the system to present?',
        type: 'multiple-choice',
        options: [
          { label: 'Wired connection (HDMI)', value: 'hdmi' },
          { label: 'Wireless presentation (e.g., Barco ClickShare, Crestron AirMedia)', value: 'wireless' },
        ],
      },
      {
        id: 'controlSystem',
        text: 'How should the room be controlled?',
        type: 'select',
        options: [
          { label: 'Simple remote control', value: 'remote' },
          { label: 'Tabletop touch panel', value: 'touch_panel' },
          { label: 'Wall-mounted keypad', value: 'keypad' },
          { label: 'No centralized control needed', value: 'none' },
        ],
      },
      { id: 'other', text: 'Are there any other specific requirements or features needed?', type: 'text' },
    ],
  },
];