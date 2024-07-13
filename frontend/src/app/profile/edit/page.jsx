import React from "react";

const EditProfilePage = () => {
  const mockData = {
    name: "Isabelle St-Jean",
    gender: "female",
    location: "Vancouver, B.C.",
    country: "Canada",
    languages: ["English", "French"],
    qualifications: [
      "Registered Social Worker",
      "Registered Therapeutic Counsellor",
      "Professional Certified Coach (with International Coach Federation accreditation)",
      "Certified Retirement Coach",
    ],
    specialties: [
      "Anxiety related disorders",
      "Depression",
      "Trauma",
      "Relationship Issues",
      "Major Life Transitions",
      "Retirement Issues",
      "Midlife Issues",
      "Business/Professional Challenges",
      "Workplace challenges",
    ],
    approaches: [
      "Cognitive Behavioural Therapy (CBT)",
      "Brainspotting",
      "Internal Family Systems (IFS)",
      "Coherence Therapy",
      "Gestalt Therapy",
      "Neuro Linguistic Programming (NLP)",
      "Emotional Freedom Technique (EFT)",
      "Relational Somatic Therapy",
      "Trauma Informed Therapies",
      "Mindfulness Coaching",
    ],
    available_online: true,
    bio: "As a therapist with over 20 years experience I have an uncommon ability to identify and mirror back the inner gifts of my clients while supporting them to clearly see and transcend their limitations. My counselling and coaching style includes unique, transformative exercises leading to expansive ways of thinking and being, that bring exciting possibilities within reach. I gently support and challenge my clients to be accountable as they take steps to successfully navigate difficult mental states, relationship issues, and major life transitions. My therapeutic skills draw on studies and training in: Cognitive Behavioural Therapy (CBT), Brainspotting, Internal Family Systems (IFS), Coherence Therapy, Gestalt Therapy, Neuro Linguistic Programming (NLP), Emotional Freedom Technique (EFT), Relational Somatic Therapy, Trauma Informed Therapies, Mindfulness Coaching. I work with a wide range of individuals who struggle with: Anxiety related disorders, Depression, Trauma, Relationship Issues, Major Life Transitions, Retirement Issues, Midlife Issues, Business/Professional Challenges, Workplace challenges. Originally from Montreal, and French speaking, I am a Registered Social Worker, a Registered Therapeutic Counsellor with intensive experience in somatic trauma therapy, a Professional Certified Coach (with International Coach Federation accreditation), a Certified Retirement Coach. I am also the author of Living Forward Giving Back: A Practical Guide to Fulfilment in Midlife and Beyond as well as the initiator and co-author of two award-winning anthologies: Einstein’s Business: Engaging Soul, Imagination and Excellence in the Workplace and Audacious Aging. Since 2009, I have led seminars coast to coast and internationally for professional communities and have provided counselling, coaching, to numerous individuals, couples and executives helping them with workplace or personal challenges and career development. As former member of the BC Human Resources Management Association, I have contributed years of knowledge to HR professionals through the publication of over 30 articles in the PeopleTalk magazine. Finally, I am also a caring consultant in the lives of my young adult children who are now 25 and 28.",
    bio_link:
      "https://anxietyandstressrelief.com/isabelle-st-jean-rsw-pcc-rtc/",
    booking_link: "https://anxietyandstressrelief.com/request-an-appointment/",
    clinic: "Alpine Counselling Clinic",
    fees: [""],
    profile_link:
      "https://anxietyandstressrelief.com/wp-content/uploads/2020/10/Isabelles-best-pic-150x150.jpg",
    short_summary:
      "Isabelle St-Jean specializes in anxiety-related disorders, depression, trauma, and relationship issues. She offers a range of therapeutic approaches including CBT, Brainspotting, and Mindfulness Coaching, and is available for online sessions from Vancouver, B.C., Canada.",
    summary:
      "Isabelle St-Jean is a highly experienced therapist based in Vancouver, B.C., Canada, offering online sessions through the Alpine Counselling Clinic. With over 20 years of experience, she specializes in a wide range of therapeutic approaches to help clients navigate difficult mental states and life transitions.",
    email: "isabelle.stjean@gmail.com",
    verified: true,
  };

  return (
    <div>
      <h1>Edit Profile Page</h1>
      <p>Name: {mockData.name}</p>
      <p>Gender: {mockData.gender}</p>
      <p>Location: {mockData.location}</p>
      <p>Country: {mockData.country}</p>
      <p>Languages: {mockData.languages.join(", ")}</p>
      <p>Qualifications:</p>
      <ul>
        {mockData.qualifications.map((qualification, index) => (
          <li key={index}>{qualification}</li>
        ))}
      </ul>
      <p>Specialties:</p>
      <ul>
        {mockData.specialties.map((specialty, index) => (
          <li key={index}>{specialty}</li>
        ))}
      </ul>
      <p>Approaches:</p>
      <ul>
        {mockData.approaches.map((approach, index) => (
          <li key={index}>{approach}</li>
        ))}
      </ul>
      <p>Available Online: {mockData.available_online ? "Yes" : "No"}</p>
      <p>Bio: {mockData.bio}</p>
      <p>
        Bio Link:{" "}
        <a href={mockData.bio_link} target="_blank" rel="noopener noreferrer">
          {mockData.bio_link}
        </a>
      </p>
      <p>
        Booking Link:{" "}
        <a
          href={mockData.booking_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {mockData.booking_link}
        </a>
      </p>
      <p>Clinic: {mockData.clinic}</p>
      <p>Fees: {mockData.fees.join(", ")}</p>
      {/* Troubleshooting: The profile pic link doesn't load due to CORS isuses. So we should ask the user to upload a profile picture manually.  */}
      <div>
        <p>
          Profile Link: <img src={mockData.profile_link} alt="Profile" />
        </p>
        <img
          src="https://anxietyandstressrelief.com/wp-content/uploads/2020/10/Isabelles-best-pic-150x150.jpg"
          alt="test profile pic"
        />
        <img src="https://via.placeholder.com/150" alt="Placeholder" />
        <img
          src="https://www.w3schools.com/images/w3schools_green.jpg"
          alt="W3Schools.com"
        />
      </div>

      <p>Short Summary: {mockData.short_summary}</p>
      <p>Summary: {mockData.summary}</p>
      <p>Email: {mockData.email}</p>
      <p>Verified: {mockData.verified ? "True" : "False"}</p>
    </div>
  );
};

export default EditProfilePage;
