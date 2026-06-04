async function testLogin() {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginId: 'admin-001',
      password: 'AdminPassword123',
      role: 'Admin'
    })
  });
  const data = await res.json();
  console.log(res.status, data);
}
testLogin();
