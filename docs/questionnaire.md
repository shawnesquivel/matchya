# Questionnaire Mapping Guide

This document outlines how responses from the chatbot questionnaire (in `useChatbot.js`) are interpreted and then mapped into structured filters for a therapist similarity search using Pinecone. The filter mappings reference the metadata conventions (detailed in [pinecone_metadata.md](./pinecone_metadata.md)) and the therapy styles/approaches listed in [therapy_styles.md](./therapy_styles.md).

The mappings below serve as a guide for building filter queries—for example, converting a user's preference into a query filter that includes relevant therapy styles, session durations, or techniques. This document is intended to be the foundation for future modules such as `preference_mapper.py`.

> **Balanced Approach:**  
> Because our therapist directory includes many therapy types, we strive to use a balanced approach by:
>
> - Using the `$in` operator to match a range of related labels rather than an exact string.
>   Example: `{ "approaches": { "$in": ["CBT", "Mindfulness", "Existential"] } }` will match therapists who specialize in CBT, Mindfulness, or Existential therapy if at least one of the labels is present in the therapist's metadata
> - Being cautious not to overconstrain the search (which may exclude good matches).
> - Falling back to a less restrictive query if no therapists match the full filters.

---

## Example of Therapist Profile

# Example metadata for a therapist profile in the database

# Shows the expected structure and types of fields that can be queried

```json
{
  "approaches": [
    "Emotion-Focused Therapy",
    "Somatic/experiential approaches",
    "Brainspotting",
    "..."
  ],
  "available_online": true,
  "bio": "Welcome and I acknowledge the courage it took to get here. I am Mindy...",
  "bio_link": "https://www.peak-resilience.com/mindy-chiang/",
  "booking_link": "https://peakresilience.janeapp.com/#/staff_member/90",
  "clinic": "Thrive Downtown Counselling Centre",
  "country": "Canada",
  "fees": [],
  "gender": "female",
  "languages": ["English", "Mandarin Chinese"],
  "location": "Vancouver, BC",
  "name": "Mindy Chiang",
  "profile_link": "None",
  "qualifications": ["Master of Arts in Counselling Psychology"],
  "short_summary": "Mindy specializes in accessible counselling, addiction, anxiety...",
  "specialties": ["Accessible Counselling", "Addiction", "Anxiety", "..."],
  "summary": "Mindy Chiang is a Registered Clinical Counsellor based in Vancouver, BC..."
}
```

## Overview of Structured Preferences

The questionnaire collects data into the following structured keys:

- **reason**: Main reason for seeking therapy -> filter
- **frequency**: Desired frequency or duration of therapy
- **preferred_therapy**: Preferred therapy style or approach -> narrows the therapists who specialize in that type.
- **session_type**: Preferred setting (e.g., one-on-one, group, remote, in-person) -> does not affect similarity search
- **insurance**: Whether the client has insurance coverage -> does not affect similarity search
- **insurance_provider**: Specific insurance provider (if applicable) -> does not affect similarity search
- **additional_preferences**: Any extra details the client wishes to share (freeform) -> used in the query for similarity search, LLM can also extract metdata filters

---

## Detailed Question-by-Question Mapping

Each question includes:

- **Answer Options & Reasoning:** Why the answer was chosen, and what therapy approaches it implies.
- **Suggested Filter Mapping:** How to translate the answer into a metadata filter. (Filters use operators such as `$eq` for exact matches or `$in` to include multiple related values.)

### Question 0: Main Reason for Seeking Therapy (soft filter)

- **Question Text:**
  _"first, what best describes your main reason for seeking therapy?"_

- **Mapped Preference Key:** `reason`

- **Answer Options:**

  - **specific_problem**
    **Answer Text:** "i have a specific situational problem i want to address with therapy."
    **Reasoning:**
    The client is focused on addressing a defined situational challenge.

    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Cognitive Behavioural Therapy (CBT)",
            "Solution-Focused Therapy",
            "Brief Solution Focused Therapy",
            "Motivational Interviewing",
            "Strengths-Based therapy"
          ]
        }
      }
      ```
      These approaches, drawn from the "Cognitive & Behavioral Approaches" category, are effective for problem-solving and focused interventions.

  - **improvement**
    **Answer Text:** "i have specific characteristics i want to change or improve in therapy."
    **Reasoning:**
    This choice points to a desire for self-improvement and behavior change.

    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Cognitive Behavioural Therapy (CBT)",
            "Dialectical Behaviour Therapy (DBT)",
            "Motivational Interviewing",
            "Person-Centred Therapy",
            "Strengths-Based therapy",
            "Self-compassion practices"
          ]
        },
        "specialties": {
          "$in": ["Personal growth & development", "Goal Setting", "Motivation"]
        }
      }
      ```
      Combines approaches focused on change with relevant specialties from the "Personal Development" category.

  - **growth**
    **Answer Text:** "i want to become a mentally healthier version of myself."
    **Reasoning:**
    Clients looking for personal development might benefit from more integrative or exploratory therapies.

    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Humanistic Approach/Therapies",
            "Person-Centred Therapy",
            "Mindfulness/Mindfulness-based therapies",
            "Compassion-Focused Therapy (CFT)",
            "Self-compassion practices"
          ]
        },
        "specialties": {
          "$in": [
            "Personal growth & development",
            "Self-Esteem/Self-Worth",
            "Identity & Purpose"
          ]
        }
      }
      ```
      Combines humanistic approaches with personal growth specialties.

  - **uncertain**
    **Answer Text:** "i don't have an exact reason for why i want to see a therapist."
    **Reasoning:**
    With no clear priority, a flexible, client-centered approach is recommended.
    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Person-Centred Therapy",
            "Humanistic Approach/Therapies",
            "Talk Therapy",
            "Intuitive Collaboration"
          ]
        }
      }
      ```
      These approaches emphasize flexibility and following the client's lead.

---

### Question 1: Frequency of Therapy Sessions (soft filter)

- **Question Text:**  
  _"great, thanks for sharing! do you have an idea for how frequently you want to see a therapist?"_

- **Mapped Preference Key:** `frequency`

- **Answer Options:**

  - **trial**  
    **Answer Text:** "i want to try therapy and see what would be best for me."  
    **Reasoning:**  
    Indicates a non-committal approach. Best matched with therapists who offer initial consultations.

    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Brief Solution Focused Therapy",
            "Solution-Focused Therapy",
            "Talk Therapy",
            "Person-Centred approaches"
          ]
        }
      }
      ```

  - **one_time**  
    **Answer Text:** "i want to see a therapist just one time."  
    **Reasoning:**  
    Single-session focus requires specific approaches.

    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Brief Solution Focused Therapy",
            "Solution-Focused Therapy",
            "Psychoeducation",
            "Motivational Interviewing"
          ]
        }
      }
      ```

  - **few_sessions**  
    **Answer Text:** "i want to address a problem in 2-4 sessions."  
    **Reasoning:**  
    Short-term, focused intervention approaches are most appropriate.

    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Brief Solution Focused Therapy",
            "Cognitive Behavioural Therapy (CBT)",
            "Solution-Focused Therapy",
            "Motivational Interviewing"
          ]
        }
      }
      ```

  - **long_term**  
    **Answer Text:** "i'm looking for a longer term therapist."  
    **Reasoning:**  
    Deeper work requiring sustained therapeutic relationship.

    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Psychodynamic therapy",
            "Attachment Theory/Attachment-Based Therapy",
            "Inner child work",
            "Depth Psychology",
            "Humanistic Approach/Therapies"
          ]
        }
      }
      ```

  - **low_coverage**  
    **Answer Text:** "i have low insurance coverage and a limited number of sessions."  
    **Reasoning:**  
    Focus on efficient, structured approaches within limited sessions.
    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Brief Solution Focused Therapy",
            "Solution-Focused Therapy",
            "Cognitive Behavioural Therapy (CBT)",
            "Psychoeducation"
          ]
        }
      }
      ```

---

### Question 2: Preferred Therapy Approach (soft filter)

- **Question Text:**
  _"very helpful, thanks! you're doing great :) there are many types of therapy. which of the following resonates best with you?"_

- **Mapped Preference Key:** `preferred_therapy`

- **Answer Options:**

  - **structured**
    **Answer Text:** 'structured and goal-oriented. "i like structure and a clear outcome"'
    **Reasoning:**
    Clients favoring a structured approach are steered toward therapies that provide clear, goal-driven sessions.

    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Cognitive Behavioural Therapy (CBT)",
            "Dialectical Behaviour Therapy (DBT)",
            "Solution-Focused Therapy",
            "Brief Solution Focused Therapy",
            "Acceptance & Commitment Therapy (ACT)"
          ]
        }
      }
      ```
      These approaches emphasize structured interventions and measurable outcomes.

  - **exploratory**
    **Answer Text:** 'exploratory and insight-oriented. "i want to explore my thoughts and emotions"'
    **Reasoning:**
    This option fits better with therapies that focus on deep introspection and emotional understanding.

    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Psychodynamic Therapy",
            "Emotion-Focused Therapy",
            "Depth Psychology",
            "Dream Work",
            "Jungian Analysis",
            "Attachment-based",
            "Somatic/experiential approaches"
          ]
        }
      }
      ```
      These approaches emphasize exploration, insight, and emotional depth.

  - **skill_building**
    **Answer Text:** 'skill-building and mindfulness-focused. "i want to build skills and healthy habits"'
    **Reasoning:**
    Emphasizes practical strategies and mindfulness-based approaches for personal development.

    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Mindfulness/Mindfulness-based therapies",
            "Cognitive Behavioural Therapy (CBT)",
            "Dialectical Behaviour Therapy (DBT)",
            "Body-Mind Psychotherapy",
            "Mind-body connection",
            "Nervous System Regulation",
            "Somatic/experiential approaches"
          ]
        }
      }
      ```
      These approaches focus on developing concrete skills and mindfulness practices.

  - **client_centered**
    **Answer Text:** 'flexible and client-centered. "i\'m not sure what i need yet"'
    **Reasoning:**
    Indicates uncertainty regarding a specific method, preferring a more flexible approach.
    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": [
            "Person-Centred Therapy",
            "Humanistic",
            "Integrative",
            "Eclectic",
            "Client-Centered",
            "Intuitive Collaboration",
            "Coherence Therapy"
          ]
        }
      }
      ```
      These approaches emphasize flexibility and following the client's lead.

---

### Question 3: Therapy Session Setting (affects availability filters)

- **Question Text:**  
  _"awesome! do you have a type of therapy setting you prefer? don't worry, you can always change this later :)"_

- **Mapped Preference Key:** `session_type`

- **Answer Options:**

  - **one_on_one**  
    **Answer Text:** "i prefer one-on-one sessions."  
    **Reasoning:**  
    Traditional individual therapy setting.

    - **Suggested Filter Mapping:**
      ```json
      {
        "session_type": "individual",
        "available_individual": true
      }
      ```

  - **group**  
    **Answer Text:** "i'm open to group sessions."  
    **Reasoning:**  
    Group therapy approaches.

    - **Suggested Filter Mapping:**
      ```json
      {
        "approaches": {
          "$in": ["Group Therapy", "Psychoeducation"]
        },
        "available_group": true
      }
      ```

  - **remote**  
    **Answer Text:** "i'd like online/remote sessions."  
    **Reasoning:**  
    Online therapy preference.

    - **Suggested Filter Mapping:**
      ```json
      { "available_online": true }
      ```

  - **in_person**  
    **Answer Text:** "i prefer in-person sessions."  
    **Reasoning:**  
    Traditional in-person setting.
    - **Suggested Filter Mapping:**
      ```json
      { "available_in_person": true }
      ```

---

### Question 4: Insurance Coverage (does not affect similarity search)

- **Question Text:**
  _"let's talk about insurance coverage. do you have extended health benefits?"_

- **Mapped Preference Key:** `insurance`

- **Answer Options:**

  - **has_insurance**
    **Answer Text:** "yes, i have insurance coverage"
    **Reasoning:**
    Indicates access to a broader network.
    - **Suggested Filter Mapping:**
      ```json
      { "insurance": { "$eq": true } }
      ```
  - **no_insurance**
    **Answer Text:** "no insurance coverage"
    **Reasoning:**
    Points toward out-of-pocket therapy options.
    - **Suggested Filter Mapping:**
      ```json
      { "insurance": { "$eq": false } }
      ```
  - **unknown_insurance**
    **Answer Text:** "i'm not sure about my coverage"
    **Reasoning:**
    In the absence of clear information, it may be safest not to apply strict insurance filters.
    - **Suggested Filter Mapping:**
      (None or a flexible approach that treats this similarly to no insurance.)

---

### Question 5: Insurance Provider (does not affect similarity search)

- **Question Text:**
  _"which insurance provider do you have?"_

- **Mapped Preference Key:** `insurance_provider`

- **Answer Options (Direct Mapping):**

  - **blue_cross** → "Blue Cross"
  - **sun_life** → "Sun Life"
  - **manulife** → "Manulife"
  - **desjardins** → "Desjardins"
  - **gms** → "GMS"
  - **greenshield** → "Greenshield"
  - **other_insurance** → "Other Provider"

- **Reasoning:**
  These selections directly capture the provider and can later be used to filter for in-network therapists.

- **Suggested Filter Mapping:**
  ```json
  { "insurance_provider": { "$eq": "<provider_value>" } }
  ```

Replace `<provider_value>` with the corresponding answer.

---

### Question 6: Additional Preferences (used for semantic search and specialty filtering)

- **Question Text:**  
  _"lastly ~ do you have any other preferences you'd like to share? some users share experience with specific issues, preferences for gender/ethnicity/sexuality, language(s), faith. you can enter it in the chat below."_

- **Mapped Preference Key:** `additional_preferences`

- **Answer Type:** Freeform chat input

- **Reasoning:**  
  This input can be used to match against specialties from various categories in `therapy_styles.md`:

  - Identity & Cultural Issues (e.g., "Men's issues", "Women's issues", "Racial & cultural identity")
  - Sexuality & Gender Identity (e.g., "LGBTIQA+ issues", "Sexual Orientation")
  - Physical Health & Body
  - Trauma & Recovery
  - Clinical Mental Health
  - Alternative & Holistic approaches

- **Suggested Processing:**
  The freeform text should be analyzed to extract relevant specialties and create additional filters based on the comprehensive specialties list in `therapy_styles.md`.

---

## Summary & Considerations for a Balanced Filtering Approach

- **Structured Filters (Questions 0-5):**
  The mappings above convert key questionnaire responses into filter criteria for a therapist similarity search. Because there are many therapy styles (see [therapy_styles.md](./therapy_styles.md)), using the `$in` operator helps capture a broad yet relevant range.

- **Avoiding Overconstraining:**
  Filtering on too many specific metadata fields (or by requiring exact matches) may overly narrow your results. For instance, if a user selects "growth" and you only filter on `["Integrative", "Humanistic", "Existential"]`, you might miss therapists who label their style slightly differently. A balanced `$in` query helps mitigate this risk.

- **Fallback Strategy:**
  As implemented in the similarity search function, if no matches are found with the full set of filters, the system falls back to a query without filters. This ensures that users still receive recommendations even if the filter is too narrow.

- **Reference Metadata Conventions:**
  For more details on how filters are applied, see [pinecone_metadata.md](./pinecone_metadata.md).

This updated guide should serve as a solid foundation for mapping user questionnaire inputs to meaningful filter criteria while keeping the therapist matching both precise and flexible.

## Example 1

For example, if a user is interested in growth, we will recommend therapists who are skilled in growth-oriented therapies such as

- CBT because it is a technique that helps people manage their stress by changing their thoughts and behaviors.
- mindfulness because it is a technique that helps people manage their stress by being present and aware of their thoughts and emotions.
- existential therapy because it is a technique that helps people manage their stress by finding meaning and purpose in their lives.

## Example 2

Another example is if a user is interested in therapy for stress, we will recommend therapists who are skilled in stress-reduction techniques such as

- CBT because it is a technique that helps people manage their stress by changing their thoughts and behaviors.
- mindfulness because it is a technique that helps people manage their stress by being present and aware of their thoughts and emotions.
- existential therapy because it is a technique that helps people manage their stress by finding meaning and purpose in their lives.
