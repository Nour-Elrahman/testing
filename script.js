const initialCourses = [
  { code: "CS201", name: "Programming II", dept: "Computer Science", credits: 3, pre: "CS101", capacity: 2, enrolled: 1 },
  { code: "CS301", name: "Data Structures", dept: "Computer Science", credits: 3, pre: "CS201", capacity: 25, enrolled: 8 },
  { code: "CS305", name: "Software Testing", dept: "Computer Science", credits: 3, pre: "CS201", capacity: 30, enrolled: 12 },
  { code: "CS310", name: "Database Systems", dept: "Computer Science", credits: 3, pre: "CS101", capacity: 20, enrolled: 9 },
  { code: "MATH201", name: "Discrete Mathematics", dept: "Mathematics", credits: 4, pre: "MATH101", capacity: 20, enrolled: 6 },
  { code: "BUS110", name: "Introduction to Management", dept: "Business", credits: 3, pre: "None", capacity: 18, enrolled: 18 },
  { code: "CS401", name: "Advanced Software Engineering", dept: "Computer Science", credits: 4, pre: "CS301", capacity: 15, enrolled: 5 }
];

let courses = JSON.parse(localStorage.getItem("campusreg_courses") || "null") || initialCourses.map(x => ({ ...x }));
let registered = JSON.parse(localStorage.getItem("campusreg_registered") || "[]");
const completed = ["CS101", "MATH101"];

function save() {
  localStorage.setItem("campusreg_courses", JSON.stringify(courses));
  localStorage.setItem("campusreg_registered", JSON.stringify(registered));
}

function msg(t, type = "ok") {
  const e = document.getElementById("message");
  e.textContent = t;
  e.className = type;
  e.style.display = "block";
  setTimeout(() => e.style.display = "none", 4200);
}

function render() {
  const q = document.getElementById("search").value.toLowerCase();
  const d = document.getElementById("department").value;

  document.getElementById("courses").innerHTML = courses
    .filter(c => (!d || c.dept === d) && (`${c.code} ${c.name}`.toLowerCase().includes(q)))
    .map(c => {
      const full = c.enrolled >= c.capacity;
      return `<tr>
        <td><b>${c.code}</b><br>${c.name}<br><span class="tag">${c.dept}</span></td>
        <td>${c.credits}</td>
        <td>${c.pre}</td>
        <td><span class="tag ${full ? 'full' : 'open'}">${c.enrolled}/${c.capacity} ${full ? 'Full' : 'Open'}</span></td>
        <td><button onclick="addCourse('${c.code}')">Register</button></td>
      </tr>`;
    }).join("") || `<tr><td colspan="5" class="empty">No matching courses.</td></tr>`;

  document.getElementById("registered").innerHTML = registered.map(code => {
    const c = courses.find(x => x.code === code);
    return c ? `<tr>
      <td><b>${c.code}</b><br>${c.name}</td>
      <td>${c.credits}</td>
      <td><button class="danger" onclick="dropCourse('${c.code}')">Drop</button></td>
    </tr>` : "";
  }).join("");

  document.getElementById("empty").style.display = registered.length ? "none" : "block";

  const credits = registered.reduce((s, code) => s + (courses.find(c => c.code === code)?.credits || 0), 0);
  document.getElementById("totalCredits").textContent = credits;
  document.getElementById("courseCount").textContent = registered.length;
}

function addCourse(code) {
  const c = courses.find(x => x.code === code);
  if (!c) return;
  // Intentionally imperfect validation is included for students to discover during testing.
  if (c.enrolled > c.capacity) {
    msg("Registration failed: course is full.", "err");
    return;
  }
  registered.push(code);
  c.enrolled++;
  save();
  render();
  msg(`Successfully registered in ${code}.`);
}

function dropCourse(code) {
  const i = registered.indexOf(code);
  if (i < 0) return;
  registered.splice(i, 1);
  const c = courses.find(x => x.code === code);
  if (c) c.enrolled = Math.max(0, c.enrolled - 1);
  save();
  render();
  msg(`${code} has been dropped.`);
}

document.getElementById("search").addEventListener("input", render);
document.getElementById("department").addEventListener("change", render);
document.getElementById("reset").addEventListener("click", () => {
  if (!confirm("Reset all demo registrations and course seat counts?")) return;
  courses = initialCourses.map(x => ({ ...x }));
  registered = [];
  save();
  render();
  msg("Demo data has been reset.");
});

render();