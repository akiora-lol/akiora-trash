use ratatui::style::{Color, Style, Stylize};
use ratatui::symbols;
use ratatui::widgets::{Block, Borders, List, ListItem, Paragraph, Tabs};
use ratatui::{
    Frame,
    layout::{Constraint, Layout, Rect},
};

use crate::app::App;

pub fn render(frame: &mut Frame, app: &App) {
    let [header_area, content_area, footer_area] = Layout::vertical([
        Constraint::Percentage(20),
        Constraint::Percentage(70),
        Constraint::Percentage(10),
    ])
    .areas(frame.area());

    render_header(frame, app, header_area);
    render_content(frame, app, content_area);
    render_footer(frame, footer_area);
}

fn render_header(frame: &mut Frame, app: &App, area: Rect) {
    let tabs = Tabs::new(app.tabs.clone())
        .style(Style::default().fg(Color::Cyan))
        .highlight_style(Style::default().fg(Color::Red).bold())
        .select(app.selected_tab as usize)
        .divider(symbols::line::VERTICAL);

    frame.render_widget(tabs, area);
}

fn render_content(frame: &mut Frame, app: &App, area: Rect) {
    match app.selected_tab {
        0 => render_main(frame, app, area),
        1 => render_settings(frame, app, area),
        2 => render_about(frame, app, area),
        _ => {}
    }
}

fn render_main(frame: &mut Frame, app: &App, area: Rect) {
    let [menu_area, details_area] =
        Layout::vertical([Constraint::Percentage(50), Constraint::Percentage(50)]).areas(area);

    // Меню слева
    let list_items: Vec<ListItem> = app
        .menu
        .items
        .iter()
        .enumerate()
        .map(|(i, item)| {
            let prefix = if i == app.selected_item { "> " } else { "  " };
            let style = if i == app.selected_item {
                Style::default().fg(Color::Red).bold()
            } else {
                Style::default().fg(Color::Cyan)
            };
            ListItem::new(format!("{}{}", prefix, item)).style(style)
        })
        .collect();

    let list = List::new(list_items).block(
        Block::new()
            .bold()
            .fg(Color::Cyan)
            .border_type(ratatui::widgets::BorderType::Rounded)
            .borders(Borders::ALL)
            .title("Main Menu"),
    );
    frame.render_widget(list, menu_area);

    // Детали справа
    if app.show_details {
        let details = Paragraph::new(format!(
            "Details for: {}\n\nPress Enter to close",
            app.menu.items[app.selected_item]
        ))
        .block(Block::default().borders(Borders::ALL).title("Details"))
        .style(Style::default().fg(Color::Cyan));
        frame.render_widget(details, details_area);
    } else {
        let welcome = Paragraph::new("Select an item and press Enter to see details")
            .block(Block::default().borders(Borders::ALL).title("Info"))
            .style(Style::default().fg(Color::Cyan));
        frame.render_widget(welcome, details_area);
    }
}

fn render_settings(frame: &mut Frame, _app: &App, area: Rect) {
    let settings = Paragraph::new("Color Theme: Cyan (default)\n\nUse Tab to switch tabs")
        .block(Block::default().borders(Borders::ALL).title("Settings"))
        .style(Style::default().fg(Color::Cyan));

    frame.render_widget(settings, area);
}

fn render_about(frame: &mut Frame, _app: &App, area: Rect) {
    let about = Paragraph::new(
        "Ratatui App\n\nA simple TUI application\n\nGitHub: github.com/username/ratatui-app\n\nPress q or Esc to quit"
    )
    .block(Block::default().borders(Borders::ALL).title("About"))
    .style(Style::default().fg(Color::Cyan));

    frame.render_widget(about, area);
}

fn render_footer(frame: &mut Frame, area: Rect) {
    let footer = Paragraph::new("Tab: Switch • ↑/↓: Navigate • Enter: Details • Esc/q: Quit")
        .style(Style::default().fg(Color::Cyan));
    frame.render_widget(footer, area);
}
