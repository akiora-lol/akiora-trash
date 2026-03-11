use futures::TryStreamExt;
use mongodb::{
    Collection, Cursor, Database,
    bson::doc,
    results::{DeleteResult, InsertManyResult, InsertOneResult, UpdateResult},
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct MongoRepository<T: Send + Sync> {
    collection: Collection<T>,
}

impl<T> MongoRepository<T>
where
    T: Send + Sync + Unpin + Serialize + for<'de> Deserialize<'de>,
{
    pub fn new(db: &Database, collection_name: &str) -> Self {
        Self {
            collection: db.collection::<T>(collection_name),
        }
    }

    // Вставка одной записи без возврата результата
    pub async fn insert(&self, entity: T) -> Result<(), mongodb::error::Error> {
        self.collection.insert_one(entity).await?;
        Ok(())
    }

    // Вставка одной записи с возвратом результата
    pub async fn insert_one(&self, entity: T) -> Result<InsertOneResult, mongodb::error::Error> {
        self.collection.insert_one(entity).await
    }

    // Вставка множества записей
    pub async fn insert_many(
        &self,
        entities: Vec<T>,
    ) -> Result<InsertManyResult, mongodb::error::Error> {
        if entities.is_empty() {
            return Err(mongodb::error::Error::custom("Cannot insert empty vector"));
        }

        self.collection.insert_many(entities).await
    }

    // Поиск по ID
    pub async fn find_by_id(&self, id: &str) -> Result<Option<T>, mongodb::error::Error> {
        let filter = doc! { "id": id };
        self.collection.find_one(filter).await
    }

    // Получение всех записей (курсор)
    pub async fn find_all(&self) -> Result<Cursor<T>, mongodb::error::Error> {
        self.collection.find(doc! {}).await
    }

    // Получение всех записей в виде вектора
    pub async fn find_all_vec(&self) -> Result<Vec<T>, mongodb::error::Error> {
        let cursor = self.collection.find(doc! {}).await?;
        cursor.try_collect().await
    }

    // Поиск с кастомным фильтром
    pub async fn find_with_filter(
        &self,
        filter: mongodb::bson::Document,
    ) -> Result<Cursor<T>, mongodb::error::Error> {
        self.collection.find(filter).await
    }

    // Поиск одной записи с кастомным фильтром
    pub async fn find_one_with_filter(
        &self,
        filter: mongodb::bson::Document,
    ) -> Result<Option<T>, mongodb::error::Error> {
        self.collection.find_one(filter).await
    }

    // Обновление по ID без возврата результата
    pub async fn update(
        &self,
        id: &str,
        update: mongodb::bson::Document,
    ) -> Result<(), mongodb::error::Error> {
        let filter = doc! { "id": id };
        self.collection
            .update_one(filter, doc! { "$set": update })
            .await?;
        Ok(())
    }

    // Обновление по ID с возвратом результата
    pub async fn update_one(
        &self,
        id: &str,
        update: mongodb::bson::Document,
    ) -> Result<UpdateResult, mongodb::error::Error> {
        let filter = doc! { "id": id };
        self.collection
            .update_one(filter, doc! { "$set": update })
            .await
    }

    // Обновление с кастомным фильтром
    pub async fn update_one_with_filter(
        &self,
        filter: mongodb::bson::Document,
        update: mongodb::bson::Document,
    ) -> Result<UpdateResult, mongodb::error::Error> {
        self.collection.update_one(filter, update).await
    }

    // Множественное обновление
    pub async fn update_many(
        &self,
        filter: mongodb::bson::Document,
        update: mongodb::bson::Document,
    ) -> Result<UpdateResult, mongodb::error::Error> {
        self.collection.update_many(filter, update).await
    }

    // Удаление по ID без возврата результата
    pub async fn delete(&self, id: &str) -> Result<(), mongodb::error::Error> {
        let filter = doc! { "id": id };
        self.collection.delete_one(filter).await?;
        Ok(())
    }

    // Удаление по ID с возвратом результата
    pub async fn delete_one(&self, id: &str) -> Result<DeleteResult, mongodb::error::Error> {
        let filter = doc! { "id": id };
        self.collection.delete_one(filter).await
    }

    // Множественное удаление
    pub async fn delete_many(
        &self,
        filter: mongodb::bson::Document,
    ) -> Result<DeleteResult, mongodb::error::Error> {
        self.collection.delete_many(filter).await
    }

    // Удаление всех записей
    pub async fn delete_all(&self) -> Result<DeleteResult, mongodb::error::Error> {
        self.collection.delete_many(doc! {}).await
    }

    // Проверка существования записи
    pub async fn exists(&self, id: &str) -> Result<bool, mongodb::error::Error> {
        let filter = doc! { "id": id };
        let count = self.collection.count_documents(filter).await?;
        Ok(count > 0)
    }

    // Получение количества записей
    pub async fn count(&self) -> Result<u64, mongodb::error::Error> {
        self.collection.count_documents(doc! {}).await
    }
}
