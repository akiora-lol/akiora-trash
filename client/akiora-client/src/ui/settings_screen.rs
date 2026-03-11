use ratatui::Frame;
use ratatui::layout::{Alignment, Constraint, Layout, Rect};
use ratatui::style::{Color, Style};
use ratatui::symbols::{self, block};
use ratatui::text::{Line, Span};
use ratatui::widgets::{Block, Borders, Clear, Gauge, Paragraph};

use crate::app::App;
use crate::components::animated_block::AnimatedBlock;

#[derive(Debug, PartialEq)]
enum SettingsTab {
    Colors,
    Display,
    Effects,
}

pub fn render_settings_screen(frame: &mut Frame, app: &mut App, area: Rect) {
    let [title_area, tabs_area, content_area] = Layout::vertical([
        Constraint::Length(3),
        Constraint::Length(3),
        Constraint::Min(0),
    ])
    .areas(area);

    // Title
    let title = Paragraph::new("⚙️ Settings")
        .style(Style::default().fg(app.color_scheme.primary).bold())
        .alignment(Alignment::Center)
        .block(
            AnimatedBlock::default()
                .borders(Borders::BOTTOM)
                .border_style(Style::default().fg(app.color_scheme.secondary))
                .animation_progress(app.animation_progress)
                .into(),
        );

    frame.render_widget(title, title_area);

    // Settings tabs (just for demo, not functional)
    render_settings_tabs(frame, app, tabs_area);

    // Settings content
    render_color_settings(frame, app, content_area);
}

fn render_settings_tabs(frame: &mut Frame, app: &App, area: Rect) {
    let tabs = ["🎨 Colors", "🖥️ Display", "✨ Effects"];
    let tab_widget = ratatui::widgets::Tabs::new(tabs)
        .style(Style::default().fg(app.color_scheme.text))
        .highlight_style(Style::default().fg(app.color_scheme.accent).bold())
        .select(0)
        .divider(symbols::line::VERTICAL);

    frame.render_widget(tab_widget, area);
}

fn render_color_settings(frame: &mut Frame, app: &mut App, area: Rect) {
    let [primary_area, secondary_area, accent_area, background_area] = Layout::vertical([
        Constraint::Length(5),
        Constraint::Length(5),
        Constraint::Length(5),
        Constraint::Length(5),
    ])
    .spacing(1)
    .areas(area);

    // Primary color setting
    render_color_setting(
        frame,
        app,
        primary_area,
        "Primary Color",
        &["Cyan", "Blue", "Green", "Red", "Yellow"],
        app.color_scheme.primary,
    );

    // Secondary color setting
    render_color_setting(
        frame,
        app,
        secondary_area,
        "Secondary Color",
        &["Magenta", "Purple", "Blue", "Green"],
        app.color_scheme.secondary,
    );

    // Accent color setting
    render_color_setting(
        frame,
        app,
        accent_area,
        "Accent Color",
        &["Yellow", "Red", "Green", "Cyan"],
        app.color_scheme.accent,
    );

    // Background setting
    render_color_setting(
        frame,
        app,
        background_area,
        "Background",
        &["Black", "Dark Gray", "Blue"],
        app.color_scheme.background,
    );
}

fn render_color_setting(
    frame: &mut Frame,
    app: &App,
    area: Rect,
    title: &str,
    options: &[&str],
    current_color: Color,
) {
    let block: Block = AnimatedBlock::default()
        .title(title)
        .borders(Borders::ALL)
        .border_style(Style::default().fg(app.color_scheme.secondary))
        .style(Style::default().bg(app.color_scheme.background))
        .animation_progress(app.animation_progress)
        .into();

    let inner_area = block.inner(area);
    frame.render_widget(block, area);

    // Show color preview and options
    let preview = format!("⬤ Current: {:?}", current_color);
    let options_text = options.join(" • ");

    let text = vec![
        Line::from(preview).style(Style::default().fg(current_color)),
        Line::from(""),
        Line::from(format!("Options: {}", options_text))
            .style(Style::default().fg(app.color_scheme.text)),
    ];

    let paragraph = Paragraph::new(text).style(Style::default().fg(app.color_scheme.text));

    frame.render_widget(paragraph, inner_area);
}
