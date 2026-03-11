use crossterm::event::{
    self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode, KeyEventKind,
};
use crossterm::execute;
use crossterm::terminal::{
    EnterAlternateScreen, LeaveAlternateScreen, disable_raw_mode, enable_raw_mode,
};
use ratatui::prelude::{CrosstermBackend, Terminal};
use std::io;
use std::panic;

mod app;
mod ui;

use app::App;

fn main() -> io::Result<()> {
    let original_hook = panic::take_hook();
    panic::set_hook(Box::new(move |panic_info| {
        let _ = restore_terminal();
        original_hook(panic_info);
    }));

    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;

    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    let mut app = App::new();
    let res = run_app(&mut terminal, &mut app);

    restore_terminal()?;

    res
}

fn restore_terminal() -> io::Result<()> {
    disable_raw_mode()?;
    execute!(io::stdout(), LeaveAlternateScreen, DisableMouseCapture)?;
    Ok(())
}

fn run_app(terminal: &mut Terminal<CrosstermBackend<io::Stdout>>, app: &mut App) -> io::Result<()> {
    loop {
        terminal.draw(|f| ui::render(f, app))?;

        if event::poll(std::time::Duration::from_millis(1000))? {
            if let Event::Key(key) = event::read()? {
                match key.code {
                    KeyCode::Esc | KeyCode::Char('q') => return Ok(()),
                    KeyCode::Tab => {
                        if key.kind == KeyEventKind::Press {
                            app.selected_tab = (app.selected_tab + 1) % app.tabs.len();
                        }
                    }
                    KeyCode::Up => {
                        if key.kind == KeyEventKind::Press {
                            app.selected_item = (app.selected_item + app.menu.items.len() - 1)
                                % app.menu.items.len();
                        }
                    }
                    KeyCode::Down => {
                        if key.kind == KeyEventKind::Press {
                            app.selected_item = (app.selected_item + 1) % app.menu.items.len();
                        }
                    }
                    KeyCode::Char('h') => {
                        if key.kind == KeyEventKind::Press {
                            app.show_details = !app.show_details;
                        }
                    }
                    _ => {}
                }
            }
        }
    }
}
