use ratatui::Frame;
use ratatui::layout::{Alignment, Constraint, Layout, Rect};
use ratatui::style::{Color, Style};
use ratatui::text::{Line, Span};
use ratatui::widgets::{Block, Borders, Clear, Paragraph};

use crate::app::App;
use crate::components::animated_block::AnimatedBlock;

pub fn render_about_screen(frame: &mut Frame, app: &mut App, area: Rect) {
    let [title_area, content_area, github_area, footer_area] = Layout::vertical([
        Constraint::Length(3),
        Constraint::Min(0),
        Constraint::Length(3),
        Constraint::Length(3),
    ])
    .areas(area);

    // Title with animation
    let title = Paragraph::new("📱 About This Application")
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

    // Content
    let content = vec![
        Line::from(""),
        Line::from("✨ Ratatui TUI Application")
            .style(Style::default().fg(app.color_scheme.accent).bold()),
        Line::from(""),
        Line::from("A beautiful terminal user interface built with:"),
        Line::from("  • ratatui - Terminal UI library"),
        Line::from("  • crossterm - Terminal manipulation"),
        Line::from("  • tachyonfx - Special effects and animations"),
        Line::from(""),
        Line::from("🎯 Features:"),
        Line::from("  • Multiple screens with smooth transitions"),
        Line::from("  • Interactive menu system"),
        Line::from("  • Real-time animations"),
        Line::from("  • Customizable color schemes"),
        Line::from("  • Mouse support"),
        Line::from(""),
        Line::from("📦 Version: 1.0.0"),
        Line::from("📅 Built with Rust 2021"),
    ];

    let content_paragraph = Paragraph::new(content)
        .style(Style::default().fg(app.color_scheme.text))
        .block(Block::default().borders(Borders::NONE));

    frame.render_widget(content_paragraph, content_area);

    // GitHub link
    let github_text = vec![
        Line::from("🔗 GitHub Repository"),
        Line::from("https://github.com/username/ratatui-app"),
    ];

    let github_block = AnimatedBlock::default()
        .title("🌐 Source Code")
        .borders(Borders::ALL)
        .border_style(Style::default().fg(app.color_scheme.secondary))
        .style(Style::default().bg(app.color_scheme.background))
        .animation_progress(app.animation_progress);

    let github_paragraph = Paragraph::new(github_text)
        .block(github_block.into())
        .style(Style::default().fg(Color::Blue).underlined())
        .alignment(Alignment::Center);

    frame.render_widget(github_paragraph, github_area);

    // Footer
    let footer_text = "Press Tab to switch screens • Esc to go back";
    let footer_paragraph = Paragraph::new(footer_text)
        .style(Style::default().fg(app.color_scheme.text))
        .alignment(Alignment::Center)
        .block(
            Block::default()
                .borders(Borders::TOP)
                .border_style(Style::default().fg(app.color_scheme.secondary)),
        );

    frame.render_widget(footer_paragraph, footer_area);
}
