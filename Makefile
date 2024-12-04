.PHONY: build up down logs test migrate clean

up:
	docker-compose up -d --build

down:
	docker-compose down

logs:
	docker-compose logs -f

test:
	docker-compose exec app npm test

make-migrate:
	docker-compose exec -u node -w /app/server app npx knex migrate:make $(name)

migrate:
	docker-compose exec -w /app/server app npx knex migrate:latest

clean:
	docker-compose down -v
	rm -rf node_modules