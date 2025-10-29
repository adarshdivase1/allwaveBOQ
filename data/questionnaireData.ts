import type { QuestionnaireSection } from '../types';

export const questionnaire: QuestionnaireSection[] = [
  {
    title: '1. Room Fundamentals',
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
      {
        id: 'budgetLevel',
        text: 'What is the budget level for this room?',
        type: 'select',
        options: [
            { label: 'Mid-Range / Standard (Best balance)', value: 'mid_range' },
            { label: 'Budget-Friendly (Cost-effective)', value: 'budget_friendly' },
            { label: 'High-End / Premium (Top-tier performance)', value: 'high_end' },
        ],
      },
      {
        id: 'tableShape',
        text: 'What is the shape of the primary table/seating arrangement?',
        type: 'select',
        options: [
          { label: 'Long Boardroom/Rectangle Table', value: 'boardroom_long' },
          { label: 'U-Shape', value: 'u_shape' },
          { label: 'Classroom Style (Rows)', value: 'classroom_rows' },
          { label: 'Round/Square Table', value: 'round_square' },
          { label: 'No Table / Open Space', value: 'open_space' },
        ],
      },
      {
        id: 'aesthetics',
        text: 'What is the aesthetic requirement for the equipment?',
        type: 'select',
        options: [
            { label: 'Standard (Visible equipment is acceptable)', value: 'standard' },
            { label: 'Architecturally Integrated (Hide equipment where possible)', value: 'integrated' },
        ],
      },
    ],
  },
  {
    title: '2. Display System',
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
       {
        id: 'interactiveDisplay',
        text: 'Is an interactive/touch display required for collaboration?',
        type: 'select',
        options: [
          { label: 'Yes, interactive capability is essential', value: 'yes' },
          { label: 'No, a standard non-touch display is sufficient', value: 'no' },
        ],
      },
    ],
  },
  {
    title: '3. Video Conferencing',
    questions: [
      {
        id: 'conferencing',
        text: 'Will video conferencing be used in this room?',
        type: 'select',
        options: [
          { label: 'Yes, this is a primary function', value: 'primary_vc' },
          { label: 'Yes, but for occasional use', value: 'occasional_vc' },
          { label: 'No, this room is for local presentation only', value: 'no_vc' },
        ],
      },
      {
        id: 'vcPlatform',
        text: 'What is the primary video conferencing platform?',
        type: 'select',
        options: [
          { label: 'Bring Your Own Device (BYOD) - Users connect laptops', value: 'byod' },
          { label: 'Dedicated Room System (e.g., Microsoft Teams Room, Zoom Room)', value: 'dedicated_room_system' },
          { label: 'Not Sure / Both', value: 'flexible_vc' },
        ],
      },
      {
        id: 'cameraNeeds',
        text: 'What are the camera requirements for video conferencing?',
        type: 'select',
        options: [
          { label: 'Standard PTZ (Pan-Tilt-Zoom) camera', value: 'ptz_standard' },
          { label: 'Auto-framing / Speaker Tracking Camera', value: 'speaker_tracking' },
          { label: 'Multiple cameras for different views', value: 'multi_camera' },
          { label: 'No camera needed', value: 'no_camera' },
        ],
      },
    ],
  },
  {
    title: '4. Audio System',
    questions: [
      {
        id: 'microphoneType',
        text: 'What type of microphones are preferred for participants?',
        type: 'multiple-choice',
        options: [
          { label: 'Ceiling microphones (for a clean table)', value: 'ceiling_mics' },
          { label: 'Tabletop microphones (wired or wireless)', value: 'table_mics' },
          { label: 'Microphone integrated into a soundbar/video bar', value: 'bar_mics' },
          { label: 'No microphones needed', value: 'no_mics' },
        ],
      },
      {
        id: 'presenterMicrophone',
        text: 'Does a presenter need a dedicated microphone?',
        type: 'multiple-choice',
        options: [
          { label: 'Yes, a wireless handheld microphone', value: 'wireless_handheld' },
          { label: 'Yes, a wireless lavalier/lapel microphone', value: 'wireless_lavalier' },
          { label: 'Yes, a microphone at a lectern', value: 'lectern_mic' },
          { label: 'No dedicated presenter mic needed', value: 'no_presenter_mic' },
        ],
      },
      {
        id: 'audioPlayback',
        text: 'What are the audio playback requirements?',
        type: 'select',
        options: [
          { label: 'Voice reinforcement only (for calls and speech)', value: 'voice_only' },
          { label: 'High-quality program audio (for videos, music)', value: 'program_audio' },
        ],
      },
    ],
  },
  {
    title: '5. Connectivity & Control',
    questions: [
      {
        id: 'connectivity',
        text: 'How will users connect their devices to present?',
        type: 'multiple-choice',
        options: [
          { label: 'Wireless Presentation (e.g., ClickShare, AirMedia)', value: 'wireless' },
          { label: 'Wired HDMI at the table', value: 'hdmi_table' },
          { label: 'Wired USB-C at the table (video & power)', value: 'usbc_table' },
          { label: 'Wired connections at a wall plate', value: 'wall_plate_connections' },
        ],
      },
      {
        id: 'controlSystem',
        text: 'How should the room AV system be controlled?',
        type: 'select',
        options: [
          { label: 'Simple remote or auto-source switching', value: 'remote' },
          { label: 'Wall-mounted keypad for basic functions', value: 'keypad' },
          { label: 'Tabletop touch panel for full control', value: 'touch_panel' },
          { label: 'No centralized control needed', value: 'none' },
        ],
      },
    ],
  },
  {
    title: '6. Additional Features',
    questions: [
        {
          id: 'roomScheduling',
          text: 'Is a room scheduling panel required outside the room?',
          type: 'select',
          options: [
            { label: 'Yes, a scheduling panel is needed', value: 'yes' },
            { label: 'No, not required', value: 'no' },
          ],
        },
        {
          id: 'lectureCapture',
          text: 'Is there a requirement to record or stream meetings?',
          type: 'select',
          options: [
            { label: 'Yes, recording and/or streaming is needed', value: 'yes' },
            { label: 'No, not required', value: 'no' },
          ],
        },
        {
          id: 'assistedListening',
          text: 'Is an Assisted Listening System (ALS) required for accessibility?',
          type: 'select',
          options: [
            { label: 'Yes, an ALS is required', value: 'yes' },
            { label: 'No, not required', value: 'no' },
          ],
        },
        { id: 'other', text: 'Are there any other specific requirements?', type: 'text' },
    ],
  },
];
