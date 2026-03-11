use ratatui::Frame;
use ratatui::layout::Rect;
use ratatui::style::{Color, Style};
use ratatui::symbols;
use ratatui::widgets::{Block, Borders, Tabs};

use crate::app::App;

pub fn render_tabs(frame: &mut Frame, app: &App, area: Rect, selected_tab: usize) {
    let tabs = Tabs::new(app.tabs.iter().map(|s| s.as_str()).collect::<Vec<_>>())
        .block(
            Block::default()
                .borders(Borders::NONE)
                .style(Style::default().bg(app.color_scheme.background)),
        )
        .style(Style::default().fg(app.color_scheme.text))
        .highlight_style(Style::default().fg(app.color_scheme.primary).bold())
        .select(selected_tab)
        .divider(symbols::line::VERTICAL)
        .padding(" ", " ");

    frame.render_widget(tabs, area);
}
