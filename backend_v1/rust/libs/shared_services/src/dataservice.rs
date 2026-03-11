use crate::MongoRepository;

use mongodb::{
    Cursor,
    results::{DeleteResult, InsertManyResult, InsertOneResult, UpdateResult},
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct DataService<T: Send + Sync> {
    repo: MongoRepository<T>,
}

impl<T> DataService<T>
where
    T: Send + Sync + Unpin + Serialize + for<'de> Deserialize<'de>,
{
    pub fn new(repo: MongoRepository<T>) -> Self {
        Self { repo }
    }

    // Создание одной записи
    pub async fn create(&self, entity: T) -> Result<(), mongodb::error::Error> {
        self.repo.insert(entity).await
    }

    // Создание с возвратом результата
    pub async fn create_with_result(
        &self,
        entity: T,
    ) -> Result<InsertOneResult, mongodb::error::Error> {
        self.repo.insert_one(entity).await
    }

    // Вставка множества записей
    pub async fn create_many(
        &self,
        entities: Vec<T>,
    ) -> Result<InsertManyResult, mongodb::error::Error> {
        self.repo.insert_many(entities).await
    }

    // Получение по ID
    pub async fn get_by_id(&self, id: &str) -> Result<Option<T>, mongodb::error::Error> {
        self.repo.find_by_id(id).await
    }

    // Получение всех записей
    pub async fn get_all(&self) -> Result<Cursor<T>, mongodb::error::Error> {
        self.repo.find_all().await
    }

    // Получение всех записей в виде вектора
    pub async fn get_all_vec(&self) -> Result<Vec<T>, mongodb::error::Error> {
        self.repo.find_all_vec().await
    }

    // Обновление с Document
    pub async fn update(
        &self,
        id: &str,
        update: mongodb::bson::Document,
    ) -> Result<(), mongodb::error::Error> {
        self.repo.update(id, update).await
    }

    // Обновление с возвратом результата
    pub async fn update_with_result(
        &self,
        id: &str,
        update: mongodb::bson::Document,
    ) -> Result<UpdateResult, mongodb::error::Error> {
        self.repo.update_one(id, update).await
    }

    // Удаление по ID
    pub async fn delete(&self, id: &str) -> Result<(), mongodb::error::Error> {
        self.repo.delete(id).await
    }

    // Удаление с возвратом результата
    pub async fn delete_with_result(
        &self,
        id: &str,
    ) -> Result<DeleteResult, mongodb::error::Error> {
        self.repo.delete_one(id).await
    }

    // Удаление всех записей
    pub async fn delete_all(&self) -> Result<DeleteResult, mongodb::error::Error> {
        self.repo.delete_all().await
    }

    // Проверка существования записи
    pub async fn exists(&self, id: &str) -> Result<bool, mongodb::error::Error> {
        self.repo.exists(id).await
    }

    // Получение количества записей
    pub async fn count(&self) -> Result<u64, mongodb::error::Error> {
        self.repo.count().await
    }

    // Поиск с кастомным фильтром
    pub async fn find_with_filter(
        &self,
        filter: mongodb::bson::Document,
    ) -> Result<Cursor<T>, mongodb::error::Error> {
        self.repo.find_with_filter(filter).await
    }

    // Поиск одной записи с кастомным фильтром
    pub async fn find_one_with_filter(
        &self,
        filter: mongodb::bson::Document,
    ) -> Result<Option<T>, mongodb::error::Error> {
        self.repo.find_one_with_filter(filter).await
    }

    // Обновление с кастомным фильтром и апдейтом
    pub async fn update_with_filter(
        &self,
        filter: mongodb::bson::Document,
        update: mongodb::bson::Document,
    ) -> Result<UpdateResult, mongodb::error::Error> {
        self.repo.update_one_with_filter(filter, update).await
    }

    // Множественное обновление
    pub async fn update_many(
        &self,
        filter: mongodb::bson::Document,
        update: mongodb::bson::Document,
    ) -> Result<UpdateResult, mongodb::error::Error> {
        self.repo.update_many(filter, update).await
    }

    // Множественное удаление
    pub async fn delete_many(
        &self,
        filter: mongodb::bson::Document,
    ) -> Result<DeleteResult, mongodb::error::Error> {
        self.repo.delete_many(filter).await
    }
}
