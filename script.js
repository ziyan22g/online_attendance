// Sample student data (replace with data from your database)
const studentsByClass = {
    class1: ["John Doe", "Jane Smith", "Alice Johnson"],
    class2: ["Mike Brown", "Sarah Lee", "Chris Evans"],
    class3: ["David Wilson", "Emma Watson", "James Bond"]
};

let qrScanner = null;

// Class selection handler
document.getElementById('class-select').addEventListener('change', function() {
    const selectedClass = this.value;
    const studentList = document.getElementById('student-list');
    studentList.innerHTML = ''; // Clear previous list

    if (selectedClass && studentsByClass[selectedClass]) {
        // Show "Start Scanning" button
        document.getElementById('start-scanning').style.display = 'block';
        document.getElementById('qr-reader').style.display = 'none'; // Hide scanner initially
    } else {
        // Hide "Start Scanning" button and scanner if no class is selected
        document.getElementById('start-scanning').style.display = 'none';
        document.getElementById('qr-reader').style.display = 'none';
        if (qrScanner) {
            qrScanner.clear();
        }
    }
});

// Start Scanning Button Handler
document.getElementById('start-scanning').addEventListener('click', function() {
    // Hide "Start Scanning" button
    this.style.display = 'none';

    // Show QR code scanner
    document.getElementById('qr-reader').style.display = 'block';

    // Initialize QR Code Scanner
    if (qrScanner) {
        qrScanner.clear();
    }

    qrScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });

    qrScanner.render((qrCodeData) => {
        const studentName = qrCodeData; // Assuming QR code contains student name
        const studentList = document.getElementById('student-list');

        // Check if student already exists in the list
        const existingStudent = Array.from(studentList.children).find(card => {
            return card.querySelector('label').textContent.includes(studentName);
        });

        if (existingStudent) {
            alert(`Attendance for ${studentName} is already marked.`);
        } else {
            // Add student to the list
            const card = document.createElement('div');
            card.className = 'attendance-card';

            card.innerHTML = `
                <label>Student Name: ${studentName}</label>
                <select id="attendance-status-${studentList.children.length}">
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="Late">Late</option>
                </select>
                <input type="time" id="late-time-${studentList.children.length}" style="display: none;">
            `;

            // Show time input if "Late" is selected
            card.querySelector(`#attendance-status-${studentList.children.length}`).addEventListener('change', function() {
                const timeInput = card.querySelector(`#late-time-${studentList.children.length}`);
                timeInput.style.display = this.value === 'Late' ? 'block' : 'none';
            });

            studentList.appendChild(card);
        }
    });
});

// Handle form submission
document.getElementById('attendance-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const selectedClass = document.getElementById('class-select').value;
    const attendanceData = [];
    const attendanceCards = document.querySelectorAll('.attendance-card');

    attendanceCards.forEach((card, index) => {
        const studentName = card.querySelector('label').textContent.replace('Student Name: ', '');
        const attendanceStatus = card.querySelector(`#attendance-status-${index}`).value;
        const lateTime = card.querySelector(`#late-time-${index}`).value;
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();

        attendanceData.push({
            studentName: studentName,
            class: selectedClass,
            attendanceStatus: attendanceStatus,
            lateTime: attendanceStatus === 'Late' ? lateTime : null,
            date: currentDate,
            time: currentTime
        });
    });

    // Log the collected data (for demonstration)
    console.log('Attendance Data:', attendanceData);

    // Send data to the backend (example using Fetch API)
    fetch('/submit-attendance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendanceData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert('Attendance submitted successfully!');
        console.log('Server Response:', data);
    })
    .catch(error => {
        console.error('Error submitting attendance:', error);
        alert('Failed to submit attendance. Please try again.');
    });
});