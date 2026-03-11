#[derive(Clone)]
pub struct Menu {
    pub items: Vec<&'static str>,
}

impl Default for Menu {
    fn default() -> Self {
        Self {
            items: vec!["Main", "Ma1in", "qwer", "qwerqwer", "Settings", "About"],
        }
    }
}

#[derive(Clone)]
pub struct App {
    pub tabs: Vec<&'static str>,
    pub selected_tab: usize,
    pub menu: Menu,
    pub selected_item: usize,
    pub show_details: bool,
}

impl App {
    pub fn new() -> Self {
        Self {
            tabs: vec!["Main", "Settings", "About"],
            selected_tab: 0,
            menu: Menu::default(),
            selected_item: 0,
            show_details: false,
        }
    }
}
