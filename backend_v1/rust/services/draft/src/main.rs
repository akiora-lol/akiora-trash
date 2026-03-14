use uuid::Uuid;

#[derive(Debug, Clone, PartialEq)]
pub enum ActionType {
    Pick(usize),
    Ban(usize),
}

#[derive(Debug, Clone, PartialEq)]
pub enum TeamType {
    Red(Uuid),
    Blue(Uuid),
}

impl TeamType {
    fn switch(&self) -> Self {
        match self {
            TeamType::Red(id) => TeamType::Blue(*id),
            TeamType::Blue(id) => TeamType::Red(*id),
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum DraftType {
    Classic,  // 5 bans, 5 picks per team
    Fearless, // Нельзя пикать уже использованных чемпионов
    Random,   // Случайный драфт
}

#[derive(Debug, Clone, PartialEq)]
pub enum DraftError {
    WrongTurn(TeamType),
    AlreadyBanned(usize),
    AlreadyPicked(usize),
    DraftComplete,
    InvalidPhase,
}

#[derive(Debug, Clone)]
pub struct State {
    action_history: Vec<(ActionType, TeamType)>,
    draft_type: DraftType,
    current_turn: TeamType,
    bans_per_team: usize,
    picks_per_team: usize,
}

impl State {
    fn new(red_id: Uuid, blue_id: Uuid, draft_type: DraftType) -> Self {
        let (bans, picks) = match draft_type {
            DraftType::Classic => (5, 5),
            DraftType::Fearless => (5, 5), // Плюс доп логика запрета повторов
            DraftType::Random => (0, 5),   // Без банов
        };

        Self {
            action_history: Vec::new(),
            draft_type,
            current_turn: TeamType::Blue(blue_id), // Синяя сторона начинает (как в League)
            bans_per_team: bans,
            picks_per_team: picks,
        }
    }

    fn current_phase(&self) -> Phase {
        let total_actions = self.action_history.len();
        let total_bans = self.bans_per_team * 2;

        if total_actions < total_bans {
            Phase::Banning
        } else {
            Phase::Picking
        }
    }

    fn is_valid_action(&self, action: &ActionType, team: &TeamType) -> Result<(), DraftError> {
        // Проверка очередности
        if team != &self.current_turn {
            return Err(DraftError::WrongTurn(team.clone()));
        }

        // Проверка на завершенность драфта
        let total_actions = self.action_history.len();
        let max_actions = (self.bans_per_team + self.picks_per_team) * 2;
        if total_actions >= max_actions {
            return Err(DraftError::DraftComplete);
        }
        // Проверка на дубликаты чемпионов
        let champion_id = match action {
            ActionType::Pick(id) | ActionType::Ban(id) => *id,
        };

        for (hist_action, _) in &self.action_history {
            let hist_champion = match hist_action {
                ActionType::Pick(id) | ActionType::Ban(id) => *id,
            };
            if hist_champion == champion_id {
                return match action {
                    ActionType::Ban(_) => Err(DraftError::AlreadyBanned(champion_id)),
                    ActionType::Pick(_) => Err(DraftError::AlreadyPicked(champion_id)),
                };
            }
        }

        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum Phase {
    Banning,
    Picking,
}

pub struct Draft {
    state: State,
}

impl Draft {
    pub fn new(red_id: Uuid, blue_id: Uuid, draft_type: DraftType) -> Self {
        Self {
            state: State::new(red_id, blue_id, draft_type),
        }
    }

    pub fn next_action(&mut self, action: ActionType, team: TeamType) -> Result<State, DraftError> {
        // 1. Валидация
        self.state.is_valid_action(&action, &team)?;

        // 2. Добавляем действие в историю
        self.state.action_history.push((action, team.clone()));

        // 3. Меняем текущий ход
        self.state.current_turn = team.switch();

        // 4. Возвращаем новое состояние
        Ok(self.state.clone())
    }

    pub fn get_current_turn(&self) -> &TeamType {
        &self.state.current_turn
    }

    pub fn is_complete(&self) -> bool {
        let max_actions = (self.state.bans_per_team + self.state.picks_per_team) * 2;
        self.state.action_history.len() >= max_actions
    }
}

fn main() {
    let red_id = Uuid::new_v4();
    let blue_id = Uuid::new_v4();
    let mut draft = Draft::new(red_id, blue_id, DraftType::Classic);

    // Симуляция драфта
    println!("Current turn: {:?}", draft.get_current_turn());

    // Ban фаза (5+5 банов)
    let result = draft.next_action(ActionType::Ban(1), TeamType::Blue(blue_id));
    println!("Ban result: {:?}", result);

    let result = draft.next_action(ActionType::Ban(2), TeamType::Red(red_id));
    println!("Ban result: {:?}", result);

    // Pick фаза после банов
    for i in 0..10 {
        let result = draft.next_action(ActionType::Pick(i + 10), draft.get_current_turn().clone());
        println!("Pick {} result: {:?}", i, result);
    }

    println!("Draft complete: {}", draft.is_complete());
}
