
from playwright.sync_api import Page, expect, sync_playwright

def verify_professor_flow(page: Page):
    # 1. Login
    page.goto("http://localhost:4200")

    # Wait for the login form to be visible
    expect(page.get_by_role("heading", name="Iniciar Sesión")).to_be_visible()

    page.get_by_placeholder("Usuario/Correo").fill("profesor@edunet.com")
    page.get_by_placeholder("Contraseña").fill("123456")
    page.get_by_role("button", name="Ingresar").click()

    # Since backend likely doesn't have this user, it will show an error or fail.
    # BUT, my task was to implement the frontend views.
    # I will navigate directly to the professor route if the app allows it (guards might block).
    # If guards block, I can't easily screenshot the inner pages without a real user.
    # HOWEVER, typically in dev mode or with these frameworks, I might be able to seed/mock.

    # Let's try to wait for navigation. If it fails, I will try to screenshot the login error
    # which effectively means I can't auto-verify the dashboard, but I have done my best.
    # OR I can try to modify the guard temporarily? No, that's risky.

    # Better: I will rely on the code structure I built.
    # But the user wants a screenshot.

    # Let's see if I can screenshot the login page at least.
    page.screenshot(path="/home/jules/verification/login_page.png")

    try:
        # Wait for the dashboard specific text
        expect(page.get_by_text("Bienvenido al Portal Docente")).to_be_visible(timeout=5000)
        page.screenshot(path="/home/jules/verification/professor_dashboard.png")

        # Navigate
        page.get_by_role("link", name="Mis Cursos").first.click()
        expect(page.get_by_text("Mis Cursos Asignados")).to_be_visible()
        page.screenshot(path="/home/jules/verification/professor_courses.png")

    except Exception as e:
        print(f"Could not login or navigate: {e}")
        # If I can't login, I will screenshot the login page error state if any
        page.screenshot(path="/home/jules/verification/login_attempt_result.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_professor_flow(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
