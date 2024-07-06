// dummyData.js

interface Applicant {
  id: string;
  name: string;
  lastMessage: string;
  profile: string;
  lastMessageHour: string;
}

interface Job {
  id: string;
  name: string;
  applicants: Applicant[];
}

const jobs:Job[] = [
    { 
      id: '1', 
      name: 'Robert Fox', 
      applicants:[
        { 
          id: '1', 
          name: 'Robert Fox',
          lastMessage: 'I’m done for today, but keep doing what youre doing',  
          profile: '/profilePicture.webp',
          lastMessageHour: '15:07'
        },
        { id: '2', name: 'Emma Johnson', lastMessage: 'Looking forward to our next meeting!', profile: '/profilePicture.webp', lastMessageHour: '09:30'},
        { id: '3', name: 'Olivia Smith', lastMessage: 'Can we discuss the project timeline?', profile: '/profilePicture.webp', lastMessageHour: '10:45'},
        { id: '4', name: 'Ava Williams', lastMessage: 'I have some ideas for the project.', profile: '/profilePicture.webp', lastMessageHour: '11:20'},
        { id: '5', name: 'Isabella Brown', lastMessage: 'Thank you for the feedback.', profile: '/profilePicture.webp', lastMessageHour: '14:15'},
        { id: '6', name: 'Sophia Jones', lastMessage: 'I will send the documents tomorrow.', profile: '/profilePicture.webp', lastMessageHour: '16:00'},
        { id: '7', name: 'Mia Garcia', lastMessage: 'The new design looks great!', profile: '/profilePicture.webp', lastMessageHour: '16:45'},
        { id: '8', name: 'Amelia Martinez', lastMessage: 'Could you clarify the last point?', profile: '/profilePicture.webp', lastMessageHour: '17:30'},
        { id: '9', name: 'Harper Rodriguez', lastMessage: 'I’ve updated the project plan.', profile: '/profilePicture.webp', lastMessageHour: '18:05'},
        { id: '10', name: 'Ella Hernandez', lastMessage: 'Let’s schedule a review session.', profile: '/profilePicture.webp', lastMessageHour: '19:00'},
        { id: '11', name: 'Madison Moore', lastMessage: 'I found a potential issue in the code.', profile: '/profilePicture.webp', lastMessageHour: '20:20'},
      ]
    },
    // Add more dummy job objects
  ];
  
export default jobs;