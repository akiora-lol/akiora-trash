use ratatui::Frame;
use ratatui::layout::{Alignment, Constraint, Layout, Rect};
use ratatui::style::{Color, Style};
use ratatui::symbols;
use ratatui::text::{Line, Span};
use ratatui::widgets::{Block, Borders, Clear, List, ListItem, Paragraph, Wrap};

use crate::app::App;
use crate::components::animated_block::AnimatedBlock;

pub fn render_main_screen(frame: &mut Frame, app: &mut App, area: Rect) {
    // Create two columns: menu (30%) and details (70%)
    let [menu_area, details_area] =
        Layout::horizontal([Constraint::Percentage(30), Constraint::Percentage(70)]).areas(area);

    // Render menu
    render_menu(frame, app, menu_area);

    // Render details or welcome message
    if let Some(selected) = app.show_details {
        render_details(frame, app, details_area, selected);
    } else {
        render_welcome(frame, app, details_area);
    }
}

fn render_menu(frame: &mut Frame, app: &App, area: Rect) {
    // Create menu items
    let items: Vec<ListItem> = app
        .main_menu_items
        .iter()
        .enumerate()
        .map(|(i, item)| {
            let is_selected = i == app.selected_menu_item;
            let prefix = if is_selected { "▶ " } else { "  " };

            let content = Line::from(vec![
                Span::raw(prefix),
                Span::raw(format!("{} ", item.icon)),
                Span::styled(
                    item.name.clone(),
                    if is_selected {
                        Style::default().fg(app.color_scheme.accent).bold()
                    } else {
                        Style::default().fg(app.color_scheme.text)
                    },
                ),
            ]);

            ListItem::new(content)
        })
        .collect();

    // Create list widget
    let list = List::new(items)
        .block(
            AnimatedBlock::default()
                .title("📋 Menu")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(app.color_scheme.primary))
                .style(Style::default().bg(app.color_scheme.background))
                .animation_progress(app.animation_progress)
                .into(),
        )
        .highlight_style(Style::default().fg(app.color_scheme.accent));

    frame.render_widget(list, area);
}

fn render_details(frame: &mut Frame, app: &App, area: Rect, selected_index: usize) {
    if let Some(item) = app.main_menu_items.get(selected_index) {
        let [title_area, content_area, action_area] = Layout::vertical([
            Constraint::Length(3),
            Constraint::Min(0),
            Constraint::Length(3),
        ])
        .areas(area);

        // Title with animation
        let title_block = AnimatedBlock::default()
            .title(format!("🔍 {} Details", item.name))
            .borders(Borders::BOTTOM)
            .border_style(Style::default().fg(app.color_scheme.secondary))
            .style(Style::default().bg(app.color_scheme.background))
            .animation_progress(app.animation_progress);

        let title = Paragraph::new(format!("{} {}", item.icon, item.name))
            .style(Style::default().fg(app.color_scheme.primary).bold())
            .block(title_block.into());

        frame.render_widget(title, title_area);

        // Content
        let content = vec![
            Line::from(""),
            Line::from(format!("Description: {}", item.description)),
            Line::from(""),
            Line::from("✨ Features:"),
            Line::from("  • Real-time updates"),
            Line::from("  • Interactive controls"),
            Line::from("  • Beautiful animations"),
            Line::from(""),
            Line::from("📊 Statistics:"),
            Line::from(format!("  • Items: {}", app.main_menu_items.len())),
            Line::from("  • Status: Active"),
            Line::from("  • Version: 1.0.0"),
        ];

        let content_paragraph = Paragraph::new(content)
            .style(Style::default().fg(app.color_scheme.text))
            .block(Block::default().borders(Borders::NONE));

        frame.render_widget(content_paragraph, content_area);

        // Action buttons
        let actions = vec![Line::from(vec![
            Span::styled(
                " [Enter] ",
                Style::default().fg(Color::Black).bg(Color::Green),
            ),
            Span::raw(" Open "),
            Span::styled(" [Esc] ", Style::default().fg(Color::Black).bg(Color::Red)),
            Span::raw(" Close "),
        ])];

        let action_paragraph = Paragraph::new(actions)
            .style(Style::default().fg(app.color_scheme.text))
            .block(
                Block::default()
                    .borders(Borders::TOP)
                    .border_style(Style::default().fg(app.color_scheme.secondary)),
            )
            .alignment(Alignment::Center);

        frame.render_widget(action_paragraph, action_area);
    }
}

fn render_welcome(frame: &mut Frame, app: &App, area: Rect) {
    let welcome_text = vec![
        Line::from(""),
        Line::from("🌟 Welcome to your TUI Application!")
            .style(Style::default().fg(app.color_scheme.primary).bold()),
        Line::from(""),
        Line::from("Select an item from the menu to view details."),
        Line::from(""),
        Line::from("✨ Features:"),
        Line::from("  • Beautiful animations with tachyonfx"),
        Line::from("  • Multiple screens (Main, Settings, About)"),
        Line::from("  • Interactive menu system"),
        Line::from("  • Customizable color schemes"),
        Line::from(""),
        Line::from("📱 Navigation:"),
        Line::from("  • ↑/↓ - Navigate menu"),
        Line::from("  • Enter - View details"),
        Line::from("  • Tab - Switch between tabs"),
        Line::from("  • Esc - Go back / Quit"),
    ];

    let block = AnimatedBlock::default()
        .title("ℹ️  Welcome")
        .borders(Borders::ALL)
        .border_style(Style::default().fg(app.color_scheme.secondary))
        .style(Style::default().bg(app.color_scheme.background))
        .animation_progress(app.animation_progress);

    let paragraph = Paragraph::new(welcome_text)
        .block(block.into())
        .style(Style::default().fg(app.color_scheme.text));

    frame.render_widget(paragraph, area);
}
