const criteria = [
  {
    id: "criterion-1",
    title: "Usage without vision.",
    description:
      "Where ICT provides visual modes of operation, the ICT provides at least one mode of operation that does not require vision. This is essential for users without vision and benefits many more users in different situations. <br><br> NOTE 1: A web page or application with a well-formed semantic structure can allow users without vision to identify, navigate and interact with a visual user interface. <br><br> NOTE 2: Audio and tactile user interfaces may contribute towards meeting this clause.",
  },
  {
    id: "criterion-2",
    title: "Usage with limited vision.",
    description:
      "Where ICT provides visual modes of operation, the ICT provides features that enable users to make better use of their limited vision. This is essential for users with limited vision and benefits many more users in different situations. <br><br> NOTE 1: Magnification, reduction of required field of vision and control of contrast, brightness and intensity can contribute towards meeting this clause. <br><br> NOTE 2: Where significant features of the user interface are dependent on depth perception, the provision of additional methods of distinguishing between the features may contribute towards meeting this clause. <br><br> NOTE 3: Users with limited vision may also benefit from non-visual access.",
  },
  {
    id: "criterion-3",
    title: "Usage without perception of colour.",
    description:
      "Where ICT provides visual modes of operation, the ICT provides a visual mode of operation that does not require user perception of colour. This is essential for users with limited colour perception and benefits many more users in different situations. <br><br> NOTE: Where significant features of the user interface are colour-coded, the provision of additional methods of distinguishing between the features may contribute towards meeting this clause.",
  },
  {
    id: "criterion-4",
    title: "Non text content.",
    description:
      "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.",
    link: "https://www.w3.org/TR/WCAG21/#non-text-content",
  },
  {
    id: "criterion-5",
    title: "Sensory characteristics.",
    description:
      "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, color, size, visual location, orientation, or sound.",
    link: "https://www.w3.org/TR/WCAG21/#sensory-characteristics",
  },
  {
    id: "criterion-6",
    title: "Distinguishable use of colour.",
    description:
      "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.",
    link: "https://www.w3.org/TR/WCAG21/#use-of-color",
  },
  {
    id: "criterion-7",
    title: "Contrast.",
    description:
      "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for the following:<br><br> Large text and images of large-scale text have a contrast ratio of at least 3:1; <br><br> Incidental text or images of text that are part of an inactive user interface component, that are pure decoration, that are not visible to anyone, or that are part of a picture that contains significant other visual content, have no contrast requirement. <br><br> Logotypes, text that is part of a logo or brand name has no contrast requirement.",
    link: "https://www.w3.org/TR/WCAG21/#contrast-minimum",
  },
  {
    id: "criterion-8",
    title: "Non text contrast.",
    description:
      "The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s): <br><br> User Interface Components, Visual information required to identify user interface components and states, except for inactive components or where the appearance of the component is determined by the user agent and not modified by the author; <br><br> Graphical Objects, Parts of graphics required to understand the content, except when a particular presentation of graphics is essential to the information being conveyed.",
    link: "https://www.w3.org/TR/WCAG21/#non-text-contrast",
  },
  {
    id: "criterion-9",
    title: "Resize text.",
    description:
      "Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality. <br><br> NOTE 1: Content for which there are software players, viewers or editors with a 200 percent zoom feature would automatically meet this success criterion when used with such players, unless the content will not work with zoom. <br><br> NOTE 2: This success criterion is about the ability to allow users to enlarge the text on screen at least up to 200 % without needing to use assistive technologies. This means that the application provides some means for enlarging the text 200 % (zoom or otherwise) without loss of content or functionality or that the application works with the platform features that meet this requirement.",
    link: "https://www.w3.org/TR/WCAG21/#resize-text",
  },
  {
    id: "criterion-10",
    title: "Content on hover or focus.",
    description:
      "Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden, the following are true: <br><br> Dismissible, A mechanism is available to dismiss the additional content without moving pointer hover or keyboard focus, unless the additional content communicates an input error or does not obscure or replace other content; <br><br> Hoverable, If pointer hover can trigger the additional content, then the pointer can be moved over the additional content without the additional content disappearing; <br><br> Persistent, The additional content remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid.<br><br> Exception: The visual presentation of the additional content is controlled by the user agent and is not modified by the author.",
    link: "https://www.w3.org/TR/WCAG21/#content-on-hover-or-focus",
  },
  {
    id: "criterion-11",
    title: "Keyboard accessible.",
    description:
      "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes, except where the underlying function requires input that depends on the path of the user's movement and not just the endpoints.",
    link: "https://www.w3.org/TR/WCAG21/#keyboard",
  },
  {
    id: "criterion-12",
    title: "No keyboard traps.",
    description:
      "If keyboard focus can be moved to a component of the software using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away. <br><br>2 NOTE 1: Since any part of a software that does not meet this success criterion can interfere with a user's ability to use the whole software, it is necessary for all content in the software (whether or not it is used to meet other success criteria) to meet this success criterion. <br><br>3 NOTE 2: Standard exit methods may vary by platform. For example, on many desktop platforms, the Escape key is a standard method for exiting.",
    link: "https://www.w3.org/TR/WCAG21/#no-keyboard-trap",
  },
  {
    id: "criterion-13",
    title: "Character key shortcuts.",
    description:
      "If a keyboard shortcut is implemented in content using only letter (including upper- and lower-case letters), punctuation, number, or symbol characters, then at least one of the following is true: <br><br> Turn off, A mechanism is available to turn the shortcut off; Remap, A mechanism is available to remap the shortcut to use one or more non-printable keyboard characters (e.g. Ctrl, Alt, etc); <br><br> Active only on focus, The keyboard shortcut for a user interface component is only active when that component has focus.",
    link: "https://w3c.github.io/wcag21/guidelines/#character-key-shortcuts",
  },
  {
    id: "criterion-14",
    title: "Focus order.",
    description:
      "If software can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.",
    link: "https://www.w3.org/TR/WCAG21/#focus-order",
  },
  {
    id: "criterion-15",
    title: "Focus visible.",
    description:
      "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
    link: "https://www.w3.org/TR/WCAG21/#focus-visible",
  },
  {
    id: "criterion-16",
    title: "Pointer cancellation.",
    description:
      "For functionality that can be operated using a single pointer, at least one of the following is true: <br><br> No Down-Event: The down-event of the pointer is not used to execute any part of the function. <br><br> Abort or Undo: Completion of the function is on the up-event, and a mechanism is available to abort the function before completion or to undo the function after completion. <br><br> Up Reversal: The up-event reverses any outcome of the preceding down-event. <br><br> Essential: Completing the function on the down-event is essential.",
    link: "https://www.w3.org/TR/WCAG21/#pointer-cancellation",
  },
  {
    id: "criterion-17",
    title: "Label in name.",
    description:
      "For user interface components with labels that include text or images of text, the name contains the text that is presented visually. <br><br> NOTE: A best practice is to have the text of the label at the start of the name.",
    link: "https://www.w3.org/TR/WCAG21/#label-in-name",
  },
  {
    id: "criterion-18",
    title: "On focus.",
    description:
      "When any user interface component receives focus, it does not initiate a change of context. <br><br> NOTE: Some compound documents and their user agents are designed to provide significantly different viewing and editing functionality depending upon what portion of the compound document is being interacted with (e.g. a presentation that contains an embedded spreadsheet, where the menus and toolbars of the user agent change depending upon whether the user is interacting with the presentation content, or the embedded spreadsheet content). If the user uses a mechanism other than putting focus on that portion of the compound document with which they mean to interact (e.g. by a menu choice or special keyboard gesture), any resulting change of context would not be subject to this success criterion because it was not caused by a change of focus.",
    link: "https://www.w3.org/TR/WCAG21/#on-focus",
  },
  {
    id: "criterion-19",
    title: "On input.",
    description:
      "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.",
    link: "https://www.w3.org/TR/WCAG21/#on-input",
  },
  {
    id: "criterion-20",
    title: "Error identification.",
    description:
      "The intent of this Success Criterion is to ensure that users are aware that an error has occurred and can determine what is wrong. The error message should be as specific as possible. In the case of an unsuccessful form submission, re-displaying the form and indicating the fields in error is insufficient for some users to perceive that an error has occurred.",
    link: "https://www.w3.org/TR/WCAG21/#error-identification",
  },
  {
    id: "criterion-21",
    title: "Error suggestion.",
    description:
      "If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user, unless it would jeopardize the security or purpose of the content.",
    link: "https://www.w3.org/TR/WCAG21/#error-suggestion",
  },
  {
    id: "criterion-22",
    title: "Name, Role, Value.",
    description:
      "For all user interface components (including but not limited to, form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies. <br><br>NOTE 1: This success criterion is primarily for software developers who develop or use custom user interface components. Standard user interface components on most accessibility-supported platforms already meet this success criterion when used according to specification. <br><br> NOTE 2: For conforming to this success criterion, it is usually best practice for software user interfaces to use the accessibility services provided by platform software. These accessibility services enable interoperability between software user interfaces and both assistive technologies and accessibility features of software in standardised ways. Most platform accessibility services go beyond programmatic exposure of name and role, and programmatic setting of states, properties and values (and notification of same), and specify additional information that could or should be exposed and / or set (for instance, a list of the available actions for a given user interface component, and a means to programmatically execute one of the listed actions).",
    link: "https://www.w3.org/TR/WCAG21/#name-role-value",
  },
  {
    id: "criterion-23",
    title: "Use of accessibility services.",
    description:
      "Where the software provides a user interface it shall use the applicable documented platform accessibility services. If the documented platform accessibility services do not allow the software to meet the applicable requirements, then software that provides a user interface shall use other documented services to interoperate with assistive technology. It is best practice to develop software using toolkits that automatically implement the underlying platform accessibility services.",
  },
  {
    id: "criterion-24",
    title: "Row, Column, and Headers.",
    description:
      "Where the software provides a user interface it shall make the row and column of each cell in a data table, including headers of the row and column if present, programmatically determinable by assistive technologies.",
  },
  {
    id: "criterion-25",
    title: "Values.",
    description:
      "Where the software provides a user interface, it shall make the current value of a user interface element and any minimum or maximum values of the range, if the user interface element conveys information about a range of values, programmatically determinable by assistive technologies.",
  },
  {
    id: "criterion-26",
    title: "Parent-child relationships.",
    description:
      "Where the software provides a user interface it shall make the relationship between a user interface element and any parent or children elements programmatically determinable by assistive technologies.",
  },
  {
    id: "criterion-27",
    title: "Modification of states and properties.",
    description:
      "Where permitted by security requirements, software that provides a user interface shall allow assistive technologies to programmatically modify states and properties of user interface elements, where the user can modify these items. ",
  },
  {
    id: "criterion-28",
    title: "Modifications of values and text.",
    description:
      "Where permitted by security requirements, software that provides a user interface shall allow assistive technologies to modify values and text of user interface elements using the input methods of the platform, where a user can modify these items without the use of assistive technology.",
  },
  {
    id: "criterion-29",
    title: "No disruption of accessibility features.",
    description:
      "Where software provides a user interface it shall not disrupt those documented accessibility features that are defined in platform documentation except when requested to do so by the user during the operation of the software.",
  },
  {
    id: "criterion-30",
    title: "User preferences.",
    description:
      "Where software is not designed to be isolated from its platform, and provides a user interface, that user interface shall follow the values of the user preferences for platform settings for: units of measurement, colour, contrast, font type, font size, and focus cursor except where they are overridden by the user.",
  },
  {
    id: "criterion-31",
    title: "Accessibility and compatibility features.",
    description:
      "Product documentation provided with the ICT whether provided separately or integrated within the ICT shall list and explain how to use the accessibility and compatibility features of the ICT. <br><br> NOTE 1: Accessibility and compatibility features include accessibility features that are built-in and accessibility features that provide compatibility with assistive technology. <br><br> NOTE 2: It is best practice to use WebSchemas/Accessibility 2.0 to provide meta data on the accessibility of the ICT. <br><br> NOTE 3: The accessibility statement and help pages are both examples of the provision of product information.",
    link: "https://www.w3.org/community/reports/a11y-discov-vocab/CG-FINAL-vocabulary-20241209/",
  },
  {
    id: "criterion-32",
    title: "Accessible documentation.",
    description:
      "Product documentation provided with the ICT shall be made available in at least one of the following electronic formats: <br><br> A web format that conforms to the requirements of W3C Web Content Accessibility Guidelines; <br><br> a non-web format that conforms to accessibility guidelines. <br><br> NOTE 1: This does not preclude the possibility of also providing the product documentation in other formats (electronic, printed or audio) that are not accessible. <br><br> NOTE 2: It also does not preclude the possibility of providing alternate formats that meet the needs of some specific type of users (e.g. Braille documents for blind people or easy-to-read information for persons with limited cognitive, language and learning abilities). <br><br> NOTE 3: Where documentation is incorporated into the ICT, the documentation falls under the requirements for accessibility in the present document. <br><br> NOTE 4: A user agent that supports automatic media conversion would be beneficial to enhancing accessibility.",
  },
  {
    id: "criterion-33",
    title: "Information on accessibility and compatibility features.",
    description:
      "ICT support services shall provide information on the accessibility and compatibility features that are mentioned in the product documentation. <br><br> NOTE: Accessibility and compatibility features include accessibility features that are built-in and accessibility features that provide compatibility with assistive technology.",
  },
];

let currentIndex = 0;
let totalScore = 0;

function startEvaluation() {
  currentIndex = 0;
  totalScore = 0;
  document.querySelector("#results-table tbody").innerHTML = "";
  updateScoreDisplay();
  showModal();
}

function showModal() {
  if (currentIndex >= criteria.length) {
    document.getElementById("modal").style.display = "none";
    return;
  }

  const current = criteria[currentIndex];
  document.getElementById("modal-title").textContent = current.title;
  document.getElementById("modal-description").innerHTML =
    current.description.replace(/\n/g, "<br>");

  if (current.link) {
    document.getElementById(
      "modal-link"
    ).innerHTML = `<a href="${current.link}" target="_blank" rel="noopener noreferrer">Reference: ${current.link}</a>`;
  } else {
    document.getElementById("modal-link").innerHTML = "";
  }

  const modal = document.getElementById("modal");
  modal.style.display = "block";
  modal.focus();
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

document.addEventListener("keydown", function (e) {
  const modal = document.getElementById("modal");
  if (modal.style.display === "block" && e.key === "Tab") {
    const focusable = modal.querySelectorAll("button");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

function submitResult(result) {
  const current = criteria[currentIndex];
  const score = result === "Pass" ? 1 : 0;
  totalScore += score;

  const row = `
    <tr>
      <td>${current.title}</td>
      <td>${result}</td>
      <td>${score}</td>
    </tr>
  `;
  document
    .querySelector("#results-table tbody")
    .insertAdjacentHTML("beforeend", row);
  updateScoreDisplay();

  currentIndex++;
  showModal();
}

function updateScoreDisplay() {
  document.getElementById(
    "total-score"
  ).textContent = `Score: ${totalScore} / ${criteria.length}`;
}

const results = []; // Collect data here during evaluation

function submitResult(result) {
  const current = criteria[currentIndex];
  const score = result === "Pass" ? 1 : 0;
  totalScore += score;

  results.push({
    title: current.title,
    result,
    score,
  });

  const row = `
    <tr>
      <td>${current.title}</td>
      <td>${result}</td>
      <td>${score}</td>
    </tr>
  `;
  document
    .querySelector("#results-table tbody")
    .insertAdjacentHTML("beforeend", row);
  updateScoreDisplay();

  currentIndex++;
  if (currentIndex >= criteria.length) {
    document.getElementById("modal").style.display = "none";
    document.getElementById("download-btn").style.display = "inline-block";
  } else {
    showModal();
  }
}

function downloadResults() {
  const csvHeader = "Criterion,Result,Score\n";
  const csvRows = results.map((r) => `"${r.title}","${r.result}",${r.score}`);

  // Add total score summary at the end
  const total = results.reduce((sum, r) => sum + r.score, 0);
  const summaryRow = `,,Total Score: ${total} / ${results.length}`;

  const csvContent = csvHeader + csvRows.join("\n") + "\n" + summaryRow;

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "accessibility-results.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
