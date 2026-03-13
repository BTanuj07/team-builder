require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Skill = require('../models/skill');
const Project = require('../models/project');

const skills = [
  'React', 'React Native', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
  'MongoDB', 'PostgreSQL', 'Firebase', 'AWS', 'Docker', 'Kubernetes',
  'UI/UX Design', 'Figma', 'Product Management', 'Pitching', 'Marketing',
  'Machine Learning', 'Data Science', 'Backend Development', 'Frontend Development',
  'Mobile Development', 'DevOps', 'Blockchain', 'AI/ML', 'Flutter', 'Swift',
  'Java', 'C++', 'Go', 'Rust'
];

const sampleUsers = [
  { name: 'Arjun Kumar', email: 'arjun@example.com', college: 'RVCE', skills: ['React Native', 'JavaScript', 'Firebase'] },
  { name: 'Sneha Patel', email: 'sneha@example.com', college: 'RVCE', skills: ['Node.js', 'MongoDB', 'Backend Development'] },
  { name: 'Riya Sharma', email: 'riya@example.com', college: 'RVCE', skills: ['Product Management', 'Pitching', 'UI/UX Design'] },
  { name: 'Vikram Singh', email: 'vikram@example.com', college: 'IIT Delhi', skills: ['Python', 'Machine Learning', 'Data Science'] },
  { name: 'Priya Reddy', email: 'priya@example.com', college: 'RVCE', skills: ['React', 'TypeScript', 'Frontend Development'] },
  { name: 'Rahul Verma', email: 'rahul@example.com', college: 'NIT Trichy', skills: ['AWS', 'Docker', 'DevOps'] },
  { name: 'Ananya Iyer', email: 'ananya@example.com', college: 'RVCE', skills: ['Figma', 'UI/UX Design', 'Product Management'] },
  { name: 'Karthik Nair', email: 'karthik@example.com', college: 'BITS Pilani', skills: ['Blockchain', 'Solidity', 'Web3'] },
];

const sampleProjects = [
  {
    title: 'FinTech Payment App',
    description: 'Build a mobile payment solution for small businesses',
    requiredSkills: ['React Native', 'Node.js', 'MongoDB'],
    teamSize: 4,
    timeline: '24 hours'
  },
  {
    title: 'AI-Powered Study Assistant',
    description: 'Create an AI chatbot to help students with their studies',
    requiredSkills: ['Python', 'Machine Learning', 'React'],
    teamSize: 3,
    timeline: '36 hours'
  },
  {
    title: 'Sustainable Food Delivery Platform',
    description: 'Eco-friendly food delivery with carbon footprint tracking',
    requiredSkills: ['React Native', 'Node.js', 'UI/UX Design'],
    teamSize: 5,
    timeline: '48 hours'
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Project.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create skills
    const createdSkills = await Skill.insertMany(skills.map(name => ({ name })));
    console.log(`✅ Created ${createdSkills.length} skills`);

    const skillMap = {};
    createdSkills.forEach(skill => {
      skillMap[skill.name] = skill._id;
    });

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const usersToCreate = sampleUsers.map(user => ({
      ...user,
      password: hashedPassword,
      skills: user.skills.map(skillName => skillMap[skillName]),
      availability: 'available',
      portfolioLinks: [`https://github.com/${user.name.toLowerCase().replace(' ', '')}`]
    }));

    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create projects
    const projectsToCreate = sampleProjects.map(project => ({
      ...project,
      requiredSkills: project.requiredSkills.map(skillName => skillMap[skillName]),
      createdBy: createdUsers[0]._id
    }));

    const createdProjects = await Project.insertMany(projectsToCreate);
    console.log(`✅ Created ${createdProjects.length} projects`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Sample Login Credentials:');
    console.log('Email: arjun@example.com');
    console.log('Password: password123');
    console.log('\n(All users have the same password: password123)');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
