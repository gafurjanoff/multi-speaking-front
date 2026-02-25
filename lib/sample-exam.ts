import type { Exam } from "./exam-types"

export const sampleExam: Exam = {
  id: "exam-b2-001",
  title: "B2 Speaking Exam",
  level: "B2",
  parts: [
    {
      id: "part1",
      type: "part1",
      title: "Part 1 - Short Questions",
      partNumber: 1,
      instruction:
        "In this part, I'm going to ask you three short questions about yourself and your interests. And then, you will see some photos and answer some questions about them. You will have 30 seconds to reply to each question. Begin speaking when you hear the sound.",
      prepTime: 5,
      answerTime: 5,
      questions: [
        {
          id: "p1q1",
          text: "Describe your bedroom.",
        },
        {
          id: "p1q2",
          text: "What do you usually do on weekends?",
        },
        {
          id: "p1q3",
          text: "Tell me about your favourite hobby.",
        },
      ],
    },
    {
      id: "part1_photos",
      type: "part1_photos",
      title: "Part 1 - Photo Questions",
      partNumber: 1,
      instruction:
        "Now you will see some photos and answer questions about them. You will have 10 seconds to prepare and 45 seconds to reply. Begin speaking when you hear the sound.",
      prepTime: 10,
      answerTime: 5,
      questions: [
        {
          id: "p1pq1",
          text: "What do you see in these pictures?",
          images: [
            "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop",
          ],
        },
        {
          id: "p1pq2",
          text: "Compare the two pictures. What are the differences?",
          images: [
            "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
          ],
        },
      ],
    },
    {
      id: "part2",
      type: "part2",
      title: "Part 2 - Picture Description",
      partNumber: 2,
      instruction:
        "In this part, I'm going to show you a picture and ask you three questions. You will have one minute to think about your answers before you start speaking. You will have two minutes to answer all three questions. Begin speaking when you hear the sound.",
      prepTime: 10,
      answerTime: 10,
      questions: [
        {
          id: "p2q1",
          text: "Describe a goal you have set for yourself.",
          subQuestions: [
            "Describe a goal you have set for yourself.",
            "What you will do to achieve it.",
            "How important is goal setting in a person's life?",
          ],
          images: [
            "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=500&h=350&fit=crop",
          ],
        },
      ],
    },
    {
      id: "part3",
      type: "part3",
      title: "Part 3 - For and Against",
      partNumber: 3,
      instruction:
        "In this part, you are going to speak on a topic for two minutes. You can see the topic on the screen and two lists of points - for and against - related to the topic. Choose two items from each list and give a balanced argument to represent both sides of the topic. You have one minute to prepare your argument. You will then have two minutes to speak. Begin speaking when you hear the sound.",
      prepTime: 10,
      answerTime: 10,
      questions: [
        {
          id: "p3q1",
          text: "Everyone should have a hobby.",
        },
      ],
    },
  ],
}

export interface ForAgainstData {
  topic: string
  forPoints: string[]
  againstPoints: string[]
}

export const sampleForAgainst: Record<string, ForAgainstData> = {
  p3q1: {
    topic: "Everyone should have a hobby.",
    forPoints: [
      "Having a hobby helps people relax and reduce stress after work or study.",
      "It builds creativity and new skills that can be useful in life.",
      "Hobbies make life more enjoyable and give people a sense of purpose.",
    ],
    againstPoints: [
      "Some hobbies can be expensive and hard to continue regularly.",
      "Spending too much time on hobbies may take time away from important duties.",
      "Not everyone has enough free time or energy to keep a hobby.",
    ],
  },
}
