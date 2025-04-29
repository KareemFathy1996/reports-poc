const datasets = [
  {
      id: 1,
      name: "Student Performance Dataset",
      description: "Comprehensive data on student performance across various subjects and assessments.",
      filters: {
          academicYears: {
              required: ["2023-2024", "2022-2023"],
              optional: ["2021-2022", "2020-2021", "2019-2020"]
          },
          userTypes: {
              required: ["Teacher", "HOD"],
              optional: ["Student"]
          }
      },
      jsonReference: {
          placeholder: "{{STUDENT_PERFORMANCE_DATA}}",
          sampleData: [
              {
                  "student_id": "SP123",
                  "name": "Jane Doe",
                  "year": "2023-2024",
                  "subjects": [
                      {"subject": "Math", "score": 85, "grade": "A"},
                      {"subject": "Science", "score": 78, "grade": "B+"}
                  ],
                  "teacher": "Mr. Johnson"
              }
          ]
      }
  },
  {
      id: 2,
      name: "Attendance Analysis",
      description: "Data tracking student attendance patterns across different academic years.",
      filters: {
          academicYears: {
              required: ["2023-2024"],
              optional: ["2022-2023", "2021-2022"]
          },
          userTypes: {
              required: ["Teacher"],
              optional: ["Parent", "HOD"]
          }
      },
      jsonReference: {
          placeholder: "{{ATTENDANCE_DATA}}",
          sampleData: [
              {
                  "student_id": "AT456",
                  "name": "John Smith",
                  "year": "2023-2024",
                  "attendance": {
                      "total_days": 180,
                      "present": 172,
                      "absent": 8
                  }
              }
          ]
      }
  },
  {
      id: 3,
      name: "Curriculum Coverage",
      description: "Analysis of curriculum coverage by teachers across different subjects and years.",
      filters: {
          academicYears: {
              required: ["2023-2024", "2022-2023", "2021-2022"],
              optional: []
          },
          userTypes: {
              required: ["HOD"],
              optional: ["Teacher"]
          }
      },
      jsonReference: {
          placeholder: "{{CURRICULUM_DATA}}",
          sampleData: [
              {
                  "subject": "Mathematics",
                  "year": "2023-2024",
                  "teacher": "Ms. Williams",
                  "coverage_percentage": 78,
                  "topics_covered": ["Algebra", "Geometry", "Calculus"]
              }
          ]
      }
  },
  {
      id: 4,
      name: "Parent Engagement Metrics",
      description: "Data on parent participation in school activities and communication with teachers.",
      filters: {
          academicYears: {
              required: ["2023-2024"],
              optional: ["2022-2023", "2021-2022", "2020-2021"]
          },
          userTypes: {
              required: ["Parent", "Teacher"],
              optional: ["HOD"]
          }
      },
      jsonReference: {
          placeholder: "{{PARENT_ENGAGEMENT_DATA}}",
          sampleData: [
              {
                  "parent_id": "PE789",
                  "name": "Sarah Johnson",
                  "meetings_attended": 4,
                  "communications": [
                      {"date": "2023-09-15", "type": "Email", "topic": "Progress Report"},
                      {"date": "2023-11-02", "type": "Parent-Teacher", "notes": "Good progress"}
                  ]
              }
          ]
      }
  },
  {
      id: 5,
      name: "Department Performance",
      description: "Comparative analysis of performance across different departments and subjects.",
      filters: {
          academicYears: {
              required: ["2023-2024", "2022-2023"],
              optional: ["2021-2022", "2020-2021"]
          },
          userTypes: {
              required: ["HOD"],
              optional: ["Teacher"]
          }
      },
      jsonReference: {
          placeholder: "{{DEPARTMENT_DATA}}",
          sampleData: [
              {
                  "department": "Science",
                  "year": "2023-2024",
                  "average_score": 82.5,
                  "subjects": [
                      {"subject": "Physics", "average": 85},
                      {"subject": "Chemistry", "average": 80}
                  ]
              }
          ]
      }
  },
  {
      id: 6,
      name: "Student Growth Trajectory",
      description: "Analysis of individual student growth over multiple academic years.",
      filters: {
          academicYears: {
              required: ["2023-2024", "2022-2023", "2021-2022", "2020-2021"],
              optional: ["2019-2020"]
          },
          userTypes: {
              required: ["Teacher", "Student"],
              optional: ["Parent", "HOD"]
          }
      },
      jsonReference: {
          placeholder: "{{STUDENT_GROWTH_DATA}}",
          sampleData: [
              {
                  "student_id": "ST12345",
                  "name": "John Smith",
                  "academic_years": ["2020-2021", "2021-2022", "2022-2023", "2023-2024"],
                  "growth_metrics": [
                      {"subject": "Math", "start_score": 72, "end_score": 88},
                      {"subject": "English", "start_score": 65, "end_score": 79}
                  ]
              }
          ],
          fieldReferences: [
              { path: "{{STUDENT_GROWTH_DATA[0].student_id}}", description: "Student ID" },
              { path: "{{STUDENT_GROWTH_DATA[0].name}}", description: "Student Name" },
              { path: "{{STUDENT_GROWTH_DATA[0].academic_years[0]}}", description: "First Academic Year" },
              { path: "{{STUDENT_GROWTH_DATA[0].academic_years[3]}}", description: "Latest Academic Year" },
              { path: "{{STUDENT_GROWTH_DATA[0].growth_metrics[0].subject}}", description: "Subject" },
              { path: "{{STUDENT_GROWTH_DATA[0].growth_metrics[0].start_score}}", description: "Starting Score" },
              { path: "{{STUDENT_GROWTH_DATA[0].growth_metrics[0].end_score}}", description: "Ending Score" }
          ]
      }
  }
];