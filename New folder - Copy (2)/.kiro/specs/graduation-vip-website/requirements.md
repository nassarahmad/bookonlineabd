# Requirements Document

## Introduction

The Graduation VIP Website is a personalized web platform that allows graduates to celebrate their graduation milestone by creating a custom website with a personal subdomain. The platform provides three distinct experiences: a VIP graduation page with countdown and guest messages, a luxury memory book with page-turning interface, and a friends challenge page with interactive questions. The system enables graduates to share their achievement, collect memories from friends and family, and create a lasting digital keepsake of their graduation journey.

## Glossary

- **Graduate**: The user who creates and owns the graduation website
- **Visitor**: Any person who accesses the graduation website to view content or leave messages
- **VIP_Page**: The main graduation celebration page with countdown, photos, and message collection
- **Memory_Book**: A digital book interface where visitors can write messages that appear as book pages
- **Challenge_Page**: An interactive page where visitors answer specific questions about the graduate
- **Personal_Subdomain**: A unique URL in the format {name}{year}.graduation.site
- **Message_Box**: A collection of messages submitted by visitors
- **Countdown_Timer**: A visual timer showing time remaining until graduation day
- **Guest_Message**: A message written by a visitor to the graduate
- **Rating_System**: A 1-10 numerical rating provided by visitors
- **Background_Music**: Ambient audio that plays automatically on the page
- **University_Gallery**: A collection of university-related photos displayed on the page
- **Success_Quote**: An inspirational quotation displayed on the page
- **Page_Template**: One of the three available page designs (VIP, Memory Book, or Challenge)

## Requirements

### Requirement 1: Personal Subdomain Creation

**User Story:** As a graduate, I want to create a personalized subdomain for my graduation website, so that I can share a memorable and professional URL with my friends and family.

#### Acceptance Criteria

1. WHEN a graduate provides a name and year, THE System SHALL generate a subdomain in the format {name}{year}.graduation.site
2. THE System SHALL validate that the subdomain contains only alphanumeric characters
3. IF a subdomain already exists, THEN THE System SHALL return an error message indicating the subdomain is taken
4. THE System SHALL ensure the subdomain length is between 3 and 50 characters
5. WHEN a valid subdomain is created, THE System SHALL persist the subdomain mapping to the graduate's website

### Requirement 2: Page Template Selection

**User Story:** As a graduate, I want to choose from three different page templates, so that I can select the style that best represents my graduation celebration.

#### Acceptance Criteria

1. THE System SHALL provide three Page_Template options: VIP_Page, Memory_Book, and Challenge_Page
2. WHEN a graduate selects a Page_Template, THE System SHALL apply the corresponding layout and features
3. THE System SHALL allow the graduate to preview each Page_Template before selection
4. THE System SHALL persist the selected Page_Template for the graduate's subdomain

### Requirement 3: VIP Page - Graduate Profile Display

**User Story:** As a graduate, I want to display my photo and welcome message on my VIP page, so that visitors can see my graduation celebration.

#### Acceptance Criteria

1. WHERE VIP_Page is selected, THE System SHALL display the graduate's photo prominently
2. WHERE VIP_Page is selected, THE System SHALL display a welcome message provided by the graduate
3. THE System SHALL support image uploads in JPEG, PNG, and WebP formats up to 5MB
4. THE System SHALL resize uploaded images to maintain aspect ratio while fitting the display area
5. WHEN no photo is uploaded, THE System SHALL display a default graduation cap placeholder image

### Requirement 4: Countdown Timer to Graduation Day

**User Story:** As a graduate, I want to display a countdown to my graduation day, so that visitors can see how much time remains until the celebration.

#### Acceptance Criteria

1. WHERE VIP_Page is selected, THE System SHALL display a Countdown_Timer showing days, hours, minutes, and seconds until graduation
2. WHEN the graduate sets a graduation date, THE System SHALL calculate the time remaining from the current moment
3. THE Countdown_Timer SHALL update every second to reflect accurate time remaining
4. WHEN the graduation date is reached or passed, THE System SHALL display a congratulatory message instead of the countdown
5. THE System SHALL validate that the graduation date is a valid future or past date

### Requirement 5: Guest Message Collection

**User Story:** As a graduate, I want visitors to write memories and messages for me, so that I can collect meaningful notes from friends and family.

#### Acceptance Criteria

1. THE System SHALL display a button labeled "اكتب لي ذكرى" (Write me a memory) on the VIP_Page
2. WHEN a visitor clicks the message button, THE System SHALL display a text input form
3. THE System SHALL accept Guest_Message text up to 500 characters
4. WHEN a visitor submits a Guest_Message, THE System SHALL store the message in the Message_Box
5. THE System SHALL display all submitted messages in the Message_Box in chronological order
6. THE System SHALL allow anonymous message submission without requiring visitor authentication

### Requirement 6: Background Music Playback

**User Story:** As a graduate, I want ambient music to play on my graduation page, so that visitors experience a pleasant atmosphere.

#### Acceptance Criteria

1. THE System SHALL play Background_Music automatically when the page loads
2. THE System SHALL provide a control to pause and resume the Background_Music
3. THE System SHALL support audio files in MP3 and WAV formats up to 10MB
4. THE System SHALL loop the Background_Music continuously until paused by the visitor
5. WHEN a visitor pauses the music, THE System SHALL remember the pause state for that browser session
6. THE System SHALL set the initial volume to 50 percent of maximum

### Requirement 7: University Photo Gallery

**User Story:** As a graduate, I want to display photos of my university, so that visitors can see the environment where I studied.

#### Acceptance Criteria

1. WHERE VIP_Page is selected, THE System SHALL display a University_Gallery with multiple photos
2. THE System SHALL allow the graduate to upload between 3 and 10 university photos
3. THE System SHALL display the University_Gallery photos in a grid or carousel layout
4. THE System SHALL support image uploads in JPEG, PNG, and WebP formats up to 5MB each
5. WHEN a visitor clicks a gallery photo, THE System SHALL display the photo in an enlarged view

### Requirement 8: Success Quote Display

**User Story:** As a graduate, I want to display an inspirational quote on my page, so that visitors can see a meaningful message about success and new beginnings.

#### Acceptance Criteria

1. THE System SHALL display a Success_Quote on the VIP_Page
2. THE System SHALL provide a default quote "النهاية مجرد بداية جديدة" (The end is just a new beginning)
3. THE System SHALL allow the graduate to customize the Success_Quote text up to 200 characters
4. THE System SHALL display the Success_Quote in a visually prominent style

### Requirement 9: Memory Book Page Interface

**User Story:** As a graduate, I want a digital book interface where visitors can write messages, so that I can collect memories in an elegant format.

#### Acceptance Criteria

1. WHERE Memory_Book is selected, THE System SHALL display a book-like interface with page-turning animation
2. WHEN a visitor writes a message, THE System SHALL display the message on a new book page
3. THE System SHALL allow visitors to navigate between pages using next and previous controls
4. THE System SHALL display each Guest_Message on a separate page with decorative styling
5. THE System SHALL limit each page to 300 characters to maintain readability
6. WHEN no messages exist, THE System SHALL display an invitation page prompting visitors to write the first message

### Requirement 10: Challenge Page Questions

**User Story:** As a graduate, I want visitors to answer specific questions about me, so that I can collect fun and meaningful responses from friends.

#### Acceptance Criteria

1. WHERE Challenge_Page is selected, THE System SHALL display four questions: first impression, memorable moment, final words, and rating
2. THE System SHALL provide text input fields for the first three questions
3. THE System SHALL provide a Rating_System from 1 to 10 for the rating question
4. WHEN a visitor submits responses, THE System SHALL store all four answers together as one entry
5. THE System SHALL display all submitted challenge responses in a list format
6. THE System SHALL validate that all four questions are answered before allowing submission

### Requirement 11: Visual Theme and Styling

**User Story:** As a graduate, I want my page to have an elegant visual design with university background and gold-black colors, so that the page reflects the prestige of graduation.

#### Acceptance Criteria

1. THE System SHALL apply a university-themed background image to all page templates
2. THE System SHALL use a color scheme of gold and black as primary colors
3. THE System SHALL display the graduate's photo with a graduation robe when provided
4. THE System SHALL ensure text is readable against the background with sufficient contrast
5. THE System SHALL apply responsive design that adapts to mobile, tablet, and desktop screen sizes

### Requirement 12: Message Content Validation

**User Story:** As a graduate, I want to ensure visitor messages are appropriate, so that my graduation page maintains a respectful atmosphere.

#### Acceptance Criteria

1. WHEN a visitor submits a Guest_Message, THE System SHALL validate that the message is not empty
2. THE System SHALL reject messages containing only whitespace characters
3. THE System SHALL trim leading and trailing whitespace from messages before storage
4. THE System SHALL preserve line breaks and basic formatting in messages
5. IF a message exceeds the character limit, THEN THE System SHALL display an error indicating the maximum length

### Requirement 13: Page Load Performance

**User Story:** As a graduate, I want my graduation page to load quickly, so that visitors have a smooth experience.

#### Acceptance Criteria

1. THE System SHALL load the initial page content within 3 seconds on a standard broadband connection
2. THE System SHALL optimize images to reduce file size while maintaining visual quality
3. THE System SHALL lazy-load University_Gallery images that are not immediately visible
4. THE System SHALL cache static assets for repeat visitors
5. WHEN Background_Music is loading, THE System SHALL display the page content without waiting for audio to load

### Requirement 14: Cross-Browser Compatibility

**User Story:** As a graduate, I want my page to work on all major browsers, so that all visitors can access my graduation website regardless of their browser choice.

#### Acceptance Criteria

1. THE System SHALL render correctly on Chrome, Firefox, Safari, and Edge browsers
2. THE System SHALL support browsers released within the last 2 years
3. THE System SHALL provide fallback styling for browsers that do not support advanced CSS features
4. WHEN a visitor uses an unsupported browser, THE System SHALL display a message recommending a modern browser
5. THE System SHALL ensure all interactive features function correctly across supported browsers

### Requirement 15: Mobile Responsiveness

**User Story:** As a graduate, I want my page to work well on mobile devices, so that visitors can easily view and interact with my graduation website on their phones.

#### Acceptance Criteria

1. THE System SHALL adapt the layout for screens smaller than 768 pixels wide
2. THE System SHALL ensure buttons and interactive elements are at least 44 pixels in touch target size
3. THE System SHALL stack content vertically on mobile devices for easy scrolling
4. THE System SHALL scale images appropriately to fit mobile screen widths
5. WHEN a visitor rotates their device, THE System SHALL adjust the layout to the new orientation

### Requirement 16: Data Persistence

**User Story:** As a graduate, I want all messages and settings to be saved permanently, so that my graduation website remains accessible over time.

#### Acceptance Criteria

1. WHEN a Guest_Message is submitted, THE System SHALL persist the message to permanent storage
2. THE System SHALL persist all graduate settings including photos, quotes, and template selection
3. THE System SHALL ensure data remains accessible even after server restarts
4. THE System SHALL maintain data integrity for at least 5 years after creation
5. WHEN a graduate accesses their subdomain, THE System SHALL retrieve and display all persisted data

### Requirement 17: Share Functionality

**User Story:** As a graduate, I want to easily share my graduation page link, so that I can invite friends and family to visit and leave messages.

#### Acceptance Criteria

1. THE System SHALL display the full subdomain URL prominently on the graduate's dashboard
2. THE System SHALL provide a copy-to-clipboard button for the subdomain URL
3. WHEN the copy button is clicked, THE System SHALL copy the URL and display a confirmation message
4. THE System SHALL generate a QR code that links to the graduation page
5. THE System SHALL allow the graduate to download the QR code as an image file

### Requirement 18: Message Timestamp Display

**User Story:** As a graduate, I want to see when each message was written, so that I can understand the timeline of memories shared with me.

#### Acceptance Criteria

1. WHEN a Guest_Message is submitted, THE System SHALL record the submission timestamp
2. THE System SHALL display the timestamp with each message in a human-readable format
3. THE System SHALL show relative time (e.g., "2 hours ago", "3 days ago") for recent messages
4. WHEN a message is older than 7 days, THE System SHALL display the absolute date
5. THE System SHALL use the visitor's local timezone for timestamp display

### Requirement 19: Graduate Dashboard Access

**User Story:** As a graduate, I want a private dashboard to manage my graduation page, so that I can update content and view statistics.

#### Acceptance Criteria

1. THE System SHALL provide a secure dashboard accessible only to the graduate
2. THE System SHALL require authentication to access the dashboard
3. WHEN the graduate logs into the dashboard, THE System SHALL display all submitted messages
4. THE System SHALL show the total count of messages and visitors
5. THE System SHALL allow the graduate to edit their profile photo, welcome message, and Success_Quote from the dashboard

### Requirement 20: Visitor Counter

**User Story:** As a graduate, I want to see how many people have visited my graduation page, so that I can gauge the reach of my celebration.

#### Acceptance Criteria

1. WHEN a visitor accesses the graduation page, THE System SHALL increment the visitor counter
2. THE System SHALL display the total visitor count on the graduate's dashboard
3. THE System SHALL count unique visitors based on browser session
4. THE System SHALL not count the graduate's own visits to their page
5. THE System SHALL persist the visitor count across page reloads and server restarts
